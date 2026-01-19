// Mock Booking Service

export const getAvailableSlots = async (date) => {
    // Simulator network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if weekend
    const day = new Date(date).getDay();
    if (day === 0 || day === 6) {
        return []; // Closed on weekends
    }

    // Return mock slots
    // 1 hour slots starting on the hour or half past.
    // e.g., 09:00, 10:30, 13:00, 14:00, 15:30
    return [
        "09:00",
        "10:00",
        "11:30",
        "14:00",
        "15:30",
        "17:00"
    ];
};

export const bookAppointment = async (details) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Always succeed in mock
    return { success: true };
};
