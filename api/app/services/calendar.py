import logging
import uuid
from dataclasses import dataclass
from datetime import datetime

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_CALENDAR_EVENTS_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events"

RATE_LIMIT_REASONS = {"rateLimitExceeded", "userRateLimitExceeded", "quotaExceeded"}


@dataclass
class PairingEvent:
    """The bits of a created Calendar event other layers need to persist:
    the Meet link to show the user, and the event_id so it can later be
    cancelled (see cancel_pairing_event)."""
    event_id: str
    meet_link: str | None


async def get_access_token(refresh_token: str) -> str | None:
    """Exchange a stored Google refresh_token for a fresh access_token.

    Returns None (after logging a warning) if Google reports the
    refresh_token as revoked/expired, so callers never have to crash the
    calling flow (e.g. booking creation) over a stale Google grant.
    """
    async with httpx.AsyncClient() as client:
        response = await client.post(
            GOOGLE_TOKEN_URL,
            data={
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "refresh_token": refresh_token,
                "grant_type": "refresh_token",
            },
        )

    if response.status_code == 400 and _error_code(response) == "invalid_grant":
        logger.warning("Google refresh_token is revoked or expired; skipping calendar event")
        return None

    response.raise_for_status()
    return response.json()["access_token"]


async def create_calendar_event(
    access_token: str,
    volunteer_name: str,
    volunteer_email: str,
    trainee_name: str,
    trainee_email: str,
    start_time: datetime,
    end_time: datetime,
) -> PairingEvent | None:
    """Create a Calendar event with a Google Meet link.

    Returns a PairingEvent (event_id + Meet link URL) on success, or None
    if Google rejects the request (revoked token, rate limit, etc.) - the
    caller is never meant to crash because a calendar invite could not be
    created.
    """
    body = {
        "summary": f"Pair Scheduling: {volunteer_name} + {trainee_name}",
        "start": {"dateTime": start_time.isoformat()},
        "end": {"dateTime": end_time.isoformat()},
        "attendees": [
            {"email": volunteer_email},
            {"email": trainee_email},
        ],
        "conferenceData": {
            "createRequest": {
                "requestId": str(uuid.uuid4()),
                "conferenceSolutionKey": {"type": "hangoutsMeet"},
            }
        },
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            GOOGLE_CALENDAR_EVENTS_URL,
            params={"conferenceDataVersion": 1, "sendUpdates": "all"},
            headers={"Authorization": f"Bearer {access_token}"},
            json=body,
        )

    if response.status_code in (401, 403) and _error_code(response) not in RATE_LIMIT_REASONS:
        logger.warning("Google rejected the access_token when creating the calendar event (revoked?)")
        return None

    if response.status_code == 429 or _error_code(response) in RATE_LIMIT_REASONS:
        logger.warning("Hit Google Calendar API rate limit; not retrying")
        return None

    try:
        response.raise_for_status()
    except httpx.HTTPStatusError:
        logger.warning("Failed to create Google Calendar event: %s", response.text)
        return None

    event = response.json()
    return PairingEvent(event_id=event["id"], meet_link=_extract_meet_link(event))


async def delete_calendar_event(access_token: str, event_id: str) -> None:
    """Cancel a previously-created Calendar event, notifying attendees.

    `sendUpdates=all` is what makes this show up as a "This event has been
    cancelled" email to both the volunteer and trainee - the same
    mechanism Google already uses to send the original invite. Never
    raises: a cancelled booking must never surface an error to the user
    just because the calendar side-effect failed.
    """
    async with httpx.AsyncClient() as client:
        response = await client.delete(
            f"{GOOGLE_CALENDAR_EVENTS_URL}/{event_id}",
            params={"sendUpdates": "all"},
            headers={"Authorization": f"Bearer {access_token}"},
        )

    if response.status_code in (404, 410):
        # Already deleted/gone (e.g. the volunteer removed it by hand) - fine.
        return

    if response.status_code in (401, 403) and _error_code(response) not in RATE_LIMIT_REASONS:
        logger.warning("Google rejected the access_token when cancelling the calendar event (revoked?)")
        return

    if response.status_code == 429 or _error_code(response) in RATE_LIMIT_REASONS:
        logger.warning("Hit Google Calendar API rate limit while cancelling; not retrying")
        return

    try:
        response.raise_for_status()
    except httpx.HTTPStatusError:
        logger.warning("Failed to cancel Google Calendar event %s: %s", event_id, response.text)


async def create_pairing_event(
    refresh_token: str | None,
    volunteer_name: str,
    volunteer_email: str,
    trainee_name: str,
    trainee_email: str,
    start_time: datetime,
    end_time: datetime,
) -> PairingEvent | None:
    """Create the Calendar event + Meet link for a pair-scheduling booking.

    This is the entry point other layers (e.g. the booking service) should
    call. It never raises: any failure along the way - no refresh_token,
    a revoked token, a rate limit, or an unexpected Google/network error -
    results in None so a calendar hiccup never blocks a booking.
    """
    if not refresh_token:
        return None

    try:
        access_token = await get_access_token(refresh_token)
    except httpx.HTTPError as exc:
        logger.warning("Failed to refresh Google access_token: %s", exc)
        return None

    if access_token is None:
        return None

    try:
        return await create_calendar_event(
            access_token=access_token,
            volunteer_name=volunteer_name,
            volunteer_email=volunteer_email,
            trainee_name=trainee_name,
            trainee_email=trainee_email,
            start_time=start_time,
            end_time=end_time,
        )
    except httpx.HTTPError as exc:
        logger.warning("Failed to create Google Calendar event: %s", exc)
        return None


async def cancel_pairing_event(refresh_token: str | None, event_id: str | None) -> None:
    """Cancel the Calendar event for a booking that's being cancelled.

    Mirrors create_pairing_event's resilience: missing refresh_token,
    missing event_id (the booking may predate this field, or the original
    calendar call may have failed), a revoked token, or any Google/network
    error all just log and return - a booking cancellation must never fail
    because the calendar side-effect couldn't complete.
    """
    if not refresh_token or not event_id:
        return

    try:
        access_token = await get_access_token(refresh_token)
    except httpx.HTTPError as exc:
        logger.warning("Failed to refresh Google access_token: %s", exc)
        return

    if access_token is None:
        return

    try:
        await delete_calendar_event(access_token=access_token, event_id=event_id)
    except httpx.HTTPError as exc:
        logger.warning("Failed to cancel Google Calendar event %s: %s", event_id, exc)


def _error_code(response: httpx.Response) -> str | None:
    try:
        payload = response.json()
    except ValueError:
        return None

    error = payload.get("error")
    if isinstance(error, str):
        return error
    if isinstance(error, dict):
        for detail in error.get("errors", []):
            reason = detail.get("reason")
            if reason:
                return reason
    return None


def _extract_meet_link(event: dict) -> str | None:
    entry_points = event.get("conferenceData", {}).get("entryPoints", [])
    for entry in entry_points:
        if entry.get("entryPointType") == "video":
            return entry.get("uri")
    return event.get("hangoutLink")
