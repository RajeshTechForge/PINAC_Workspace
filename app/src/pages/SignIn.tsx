import React from "react";
import appLogo from "/icon/Full App Logo.svg";

const SignInPage: React.FC = () => {
  const handleButtonClick = () => {
    window.ipcRenderer.send(
      "open-external-link",
      "https://pinacworkspace.vercel.app/auth/sign-up/?app-auth=true"
    );
  };

  const handleLinkClick = () => {
    window.ipcRenderer.send(
      "open-external-link",
      "https://pinacworkspace.vercel.app/auth/sign-in/?app-auth=true"
    );
  };

  return (
    <div className="h-screen w-full flex justify-center items-center bg-[#090c13] relative overflow-hidden">
      <div className="h-[500px] w-[380px] p-10 pt-10 pb-10 rounded-2xl bg-[rgba(13,17,26,0.4)] backdrop-blur-lg shadow-[0_0_1.5px_#ececec] relative z-[100] flex flex-col justify-between items-center text-center">
        <img src={appLogo} alt="App Logo" className="w-full" />
        <div className="w-full">
          <button
            className="w-full bg-[#0090c1] text-white border-none rounded-lg py-[15px] text-lg cursor-pointer transition-colors duration-300 hover:bg-[#007aa6]"
            onClick={handleButtonClick}
          >
            Sign Up
          </button>
          <div className="text-[#ececec] my-[7px] font-sans">
            Already a user?
            <span
              className="text-[#0090c1] no-underline transition-colors duration-300 cursor-pointer hover:text-[#007aa6]"
              onClick={handleLinkClick}
            >
              {" "}
              Sign In
            </span>
          </div>
          <p className="text-[rgb(197,197,197)] font-sans text-sm leading-[1.5] mt-5">
            This is an open-source project built with contributions from the
            community. We hope you enjoy using it.
          </p>
        </div>
      </div>
      <div className="absolute bg-gradient-to-b from-[#08b1f9] to-[#056893] rounded-full z-[50] w-[400px] h-[400px] top-[50px] right-[380px]"></div>
      <div className="absolute bg-gradient-to-b from-[#08b1f9] to-[#056893] rounded-full z-[50] w-[200px] h-[200px] bottom-[170px] left-[720px]"></div>
    </div>
  );
};

export default SignInPage;
