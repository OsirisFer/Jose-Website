// Client-side Booking Service

export const getAvailableSlots = async (date, patientCode) => {
    try {
        const res = await fetch(`/api/availability?date=${date}`, {
            headers: {
                'x-patient-code': patientCode || ''
            }
        });
        if (res.status === 401 || res.status === 403) {
            throw new Error('Unauthorized');
        }
        if (!res.ok) throw new Error('Failed to fetch availability');

        const slots = await res.json();
        return slots || [];
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const bookAppointment = async (details, patientCode) => {
    try {
        const payload = {
            ...details,
            patientCode
        };

        const res = await fetch('/api/book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
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
