"use client";

import { GoogleOAuthProvider, GoogleLogin, googleLogout, useGoogleLogin } from "@react-oauth/google";

import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";
import { useState } from "react";

const clientId = "622476427783-17vci4m4p6b9lpp5ca4svc6nmsec57rc.apps.googleusercontent.com";

const SignIn = () => {
    const router = useRouter();
    const [email, setEmail ] = useState('');
    const [password, setPassword ] = useState('');
    const [errorMessage, setErrorMessage ] = useState<string | null>(null);

    const signIn = async (provider: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email, 
                    password,
                    provider,
                }) 
            });

            if (response.status === 401) {
                const errorData = await response.json();
                setErrorMessage(errorData.message || "Unauthorized");
                return;
            } 

            if (response.status === 200) {
                const userData = await response.json();
                const now = new Date();
                const expiry = now.getTime() + 30 * 24 * 60 * 60 * 1000; 
            
                localStorage.setItem("userData", JSON.stringify({ data: userData, expiry }));
                setErrorMessage(null);
                setTimeout(() => {
                    router.push("/")
                }, 1000)
            } 

        } catch (error) {
          console.error("Failed to sign in:", error);
        }
      };

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="w-full h-full max-w-[600px] flex flex-col items-center px-4 gap-y-12 mb-5">
                    <Link href="/" passHref className="flex flex-row items-center gap-4">
                        <img src="/logo.svg" className="w-[52px]"/>
                        <p className="font-protest text-[36px] tracking-wide">MangaVerse</p>
                    </Link>
                    <div className="bg-gray-700 bg-opacity-35 px-5 py-6 rounded-md min-h-[250px] w-full flex flex-col items-center">
                        <div className="w-full flex flex-col items-center gap-y-3 pb-3">
                            <p className="text-[18px] font-semibold mb-2">Sign In</p>
                            <GoogleLoginButton/>
                            <div className="flex items-center justify-center w-full h-[40px]">
                                <div className="bgOren h-[2px] flex-grow" />  
                                <p className="mx-4 text-[18px] font-semibold">Or</p>  
                                <div className="bgOren h-[2px] flex-grow" />
                            </div>
                        </div>
                        <div className="w-full flex flex-col gap-y-4">
                            <div className="w-full flex flex-col gap-y-1">
                                <p className="text-[14px] font-regular ">Email</p>
                                <input
                                    className="text-white font-poppins w-full bgAbu no-arrows border-none outline-none rounded-sm focus:border-[#FD5F00] focus:ring-2 focus:ring-[#FD5F00] px-2 py-[5px]"
                                    value={email}
                                    type="email"
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setEmail(value);
                                    }}
                                />
                            </div>
                            <div className="w-full flex flex-col gap-y-1">
                                <p className="text-[14px] font-regular ">Password</p>
                                <input
                                    type="password"
                                    className="text-white font-poppins w-full bgAbu no-arrows border-none outline-none rounded-sm focus:border-[#FD5F00] focus:ring-2 focus:ring-[#FD5F00] px-2 py-[5px]"
                                    value={password}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setPassword(value);
                                    }}
                                />
                            </div>
                            <div className="flex flex-col items-center">
                                <p className='w-full textOren text-center text-[14px] font-medium' >{errorMessage}</p>
                            </div>
                            <button onClick={() => signIn('default')}>
                                <p className='w-full bgOren text-center py-2 rounded-sm text-[14px] font-medium' >Sign In</p>
                            </button>
                            <div className="flex flex-col gap-y-2">
                                <div className="flex flex-row gap-x-2 w-full items-center justify-center">
                                    <p className="text-[14px] font-regular ">Don't have an account ?</p>
                                    <Link href={"/register"} passHref>
                                        <p className="text-[14px] textOren font-regular">Register</p>
                                    </Link>
                                </div>
                                {/* <p className="text-[14px] textOren font-regular text-center w-full">Forgot password ?</p> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
};

export default SignIn;

const GoogleLoginButton = () => {
    const [errorMessage, setErrorMessage ] = useState<string | null>(null);
    const router = useRouter();

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            
            const accessToken = tokenResponse.access_token; 
            if (!accessToken) {
                console.error("Access token is missing");
                return;
            }

            const userInfo = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
                headers: { Authorization: `Bearer ${accessToken}` }
            }).then(res => res.json());

            if(userInfo) {
                signIn(userInfo.email, 'google');
            }
        },
        onError: () => console.log("Login Failed"),
    });

    const signIn = async (email: string, provider: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email, 
                    provider,
                }) 
            });

            if (response.status === 200) {
                const userData = await response.json();
                const now = new Date();
                const expiry = now.getTime() + 30 * 24 * 60 * 60 * 1000; 
                localStorage.setItem("userData", JSON.stringify({ data: userData, expiry }));
                setErrorMessage(null);
                setTimeout(() => {
                    router.push("/")
                }, 1000)
            } else if (response.status === 401){
                const res = await response.json();
                setErrorMessage(res.message);
            }
  
        


        } catch (error) {
          console.error("Failed to sign in:", error);
        }
    };

    return (
        <div className="w-full flex flex-col items-center justify-center gap-y-4">
            <button
                onClick={() => login()}
                className="flex flex-row items-center justify-center gap-x-4 text-[14px] font-semibold w-full px-4 py-2 bgAbu text-white  rounded-sm  hover:border-[#FD5F00] hover:ring-2 hover:ring-[#FD5F00]"
            >
                <img src="/icons/google.svg" className="w-[24px]"/>
                <p>Sign In with Google </p>
            </button>
            {errorMessage && (
                <p className='w-full textOren text-center text-[14px] font-medium' >{errorMessage}</p>
            )}
        </div>
    );
};
