const BASE_URL = import.meta.env.VITE_API_URL || ""


async function request(endpoint, { method = "GET", body, mock } = {}) {
    if (mock) {
        return new Promise((resolve) => {
            setTimeout(() => resolve(mock), 300)
        })
    }
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: body ? JSON.stringify(body) : undefined,
    })

    if (!res.ok) {
        throw new Error(`API error: ${res.status}`)
    }

    if (res.status === 204) return null
    return res.json()
}


export const api = {

    getMe: () =>
        request("/auth/me"),

    logout: () =>
        request("/auth/logout", { method: "POST" }),

    getAvailableSlots: (mock) =>
        request("/slots/available", { mock }),

    getMySlots: (mock) =>
        request("/slots/mine", { mock }),

    createSlot: (data, mock) =>
        request("/slots", { method: "POST", body: data, mock }),

    deleteSlot: (id, mock) =>
        request(`/slots/${id}`, { method: "DELETE", mock }),

    getMyBookings: (mock) =>
        request("/bookings/mine", { mock }),

    createBooking: (data, mock) =>
        request("/bookings", { method: "POST", body: data, mock }),

    getUsers: (mock) =>
        request("/admin/users", { mock }),

    updateUserRole: (id, role, mock) =>
        request(`/admin/users/${id}/role`, {
            method: "PATCH",
            body: { role },
            mock,
        }),
}
