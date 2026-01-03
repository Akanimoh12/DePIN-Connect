// For the hackathon, this is a simple mock validation.
// In a real-world scenario, this would involve more complex AI/ML models.

export function validateData(data: any): boolean {
    if (data && typeof data.temperature === 'number') {
        // Example: Validate temperature is within a reasonable range for a weather sensor
        if (data.temperature > -50 && data.temperature < 50) {
            return true;
        }
    }
    return false;
}
