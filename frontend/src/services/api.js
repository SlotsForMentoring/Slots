const BASE_URL = import.meta.env.VITE_API_URL || "";


async function request(endpoint, { method = "GET", body, mock }) {
    if (mock) {
        return new Promise((resolve) => {
            setTimeout(() => resolve(mock), 300);
        });
    }
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
    }
    
    return res.json();
}


export const api = {
    
    getAvailableSlots: (mock) =>
        request("/slots/available", { mock }),
    
    getMySlots: (mock) =>
        request("/slots/my", { mock }),
    
    createSlot: (data, mock) =>
        request("/slots", { method: "POST", body: data, mock }),
    
    deleteSlot: (id, mock) =>
        request(`/slots/${id}`, { method: "DELETE", mock }),
    
    
    getMyBookings: (mock) =>
        request("/bookings/my", { mock }),
    
    createBooking: (data, mock) =>
        request("/bookings", { method: "POST", body: data, mock }),
    
    
    getUsers: (mock) =>
        request("/admin/users", { mock }),
    
    updateUserRole: (id, role, mock) =>
        request(`/admin/users/${id}`, {
            method: "PATCH",
            body: { role },
            mock,
        }),
};