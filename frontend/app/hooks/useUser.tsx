import { useEffect, useState } from "react";
import useAxios from "./useAxios";
import { useAuth } from "../context/AuthContext";
const useUser = () => {
    const { userId } = useAuth();
    const { get, loading, error } = useAxios();
    const [user, setUser] = useState<any>(null);
    useEffect(() => {
        const fetchUser = async () => {
            const data = await get<any>("/api/users/me");
            setUser(data.data[0]);
        };
        fetchUser();
    }, [userId]);
    return { user, userLoading: loading, userError: error };
};
export default useUser;
