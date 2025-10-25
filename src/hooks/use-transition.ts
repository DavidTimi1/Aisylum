import { useEffect, useRef } from "react";


export const useTransitionOnLoad = () => {
    const ref = useRef(null);

    useEffect(() => {
        let t_id = setTimeout(() => {
            if (!ref.current) return;
            ref.current?.classList?.remove('not-animated')
        });

        return () => clearTimeout(t_id)
    }, [ref])

    return ref;
}