// Client-side Booking Service

export const getAvailableSlots = async (date) => {
    try {
        const res = await fetch(`/api/availability?date=${date}`);
        if (!res.ok) throw new Error('Failed to fetch availability');

        const slots = await res.json();
        return slots || [];
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const bookAppointment = async (details) => {
    try {
        const res = await fetch('/api/book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(details),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Booking failed');
        }

        return await res.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};
