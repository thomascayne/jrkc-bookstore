import { handleSignOutOfAppCleanupCartLocalStorage } from "@/stores/cartStore";
import { apiRequest } from "@/utils/apiClient";
// hooks/useSignOut.ts

import { useRouter } from "next/navigation";

const useSignOut = () => {
    const router = useRouter();
    if (typeof window !== 'undefined') {
        localStorage.removeItem('lastVisitedPage');
      }
    
    const signOut = async () => {
        await apiRequest<{ ok: true }>("/api/auth/signout", { method: "POST" });
        handleSignOutOfAppCleanupCartLocalStorage();
        router.refresh();
    };

    
    return signOut;
};

export default useSignOut;
