export const readSaved = (key, fallback = []) => {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch {
        return fallback;
    }
};

export const saveData = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

export const localDate = () => {
    const date = new Date();
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
};