import { useCookies } from "react-cookie";
import { useRouter } from "next/router";

const logout = () => {
    const [cookies, set_cookies] = useCookies();
    const router = useRouter();
    set_cookies('user', undefined, {
        path: "/",
        maxAge: 1,
        sameSite: true
    });
    set_cookies('events', undefined, {
        path: "/",
        maxAge: 1,
        sameSite: true
    });
    if ((process as any).browser) {
        router.push('/login');
        return (<></>);
    }
    return (<></>)
}

export default logout