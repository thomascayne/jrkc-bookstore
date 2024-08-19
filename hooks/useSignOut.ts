import { handleSignOutOfAppCleanupCartLocalStorage } from "@/stores/cartStore";
import { createClient } from "@/utils/supabase/client";
// hooks/useSignOut.ts

import { useRouter } from "next/navigation";

const useSignOut = () => {
    const router = useRouter();
    const supabase = createClient();

    if (typeof window !== 'undefined') {
        localStorage.removeItem('lastVisitedPage');
      }
    
    const signOut = async () => {
        await supabase.auth.signOut();
        handleSignOutOfAppCleanupCartLocalStorage();
        router.refresh();
    };

    
    return signOut;
};

export default useSignOut;