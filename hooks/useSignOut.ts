// hooks/useSignOut.ts

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const useSignOut = () => {
    const router = useRouter();
    const supabase = createClient();

    const signOut = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    return signOut;
};

export default useSignOut;