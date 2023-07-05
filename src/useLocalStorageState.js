import { useState, useEffect } from "react";

export function useLocalStorageState(initialState, key) {

    const [value, setValue] = useState(function () {
        const storedValue = localStorage.getItem(key)
        return storedValue ? JSON.parse(storedValue) : initialState
    });

    //Local Storage: lưu vào bộ nhớ cục bộ mỗi khi watched thay đổi (add,remove)
    useEffect(function () {
        localStorage.setItem(key, JSON.stringify(value))
    }, [value, key])

    return [value, setValue]
}

