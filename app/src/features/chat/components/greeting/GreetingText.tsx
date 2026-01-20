import { useEffect, useState } from "react";

// Tailwind keyframes as objects for inline style
const upNDown = {
  animation: "upNDown 1s infinite",
};
const flicker0 = {
  animation: "flicker0 1s infinite",
};
const flicker1 = {
  animation: "flicker1 1s infinite",
};
const eyesMovement = {
  animation: "eyesMovement 4s infinite",
};
const shadowMovement = {
  animation: "shadowMovement 1s infinite",
};

// Add keyframes to the document (only once)
if (
  typeof window !== "undefined" &&
  !document.getElementById("ghost-keyframes")
) {
  const style = document.createElement("style");
  style.id = "ghost-keyframes";
  style.innerHTML = `
    @keyframes upNDown {
      0%,49% { transform: translateY(0px);}
      50%,100% { transform: translateY(-10px);}
    }
    @keyframes flicker0 {
      0%,49% { background-color: rgb(130,35,220);}
      50%,100% { background-color: transparent;}
    }
    @keyframes flicker1 {
      0%,49% { background-color: transparent;}
      50%,100% { background-color: rgb(130,35,220);}
    }
    @keyframes eyesMovement {
      0%,49% { transform: translateX(0px);}
      50%,99% { transform: translateX(10px);}
      100% { transform: translateX(0px);}
    }
    @keyframes shadowMovement {
      0%,49% { opacity: 0.5;}
      50%,100% { opacity: 0.2;}
    }
  `;
  document.head.appendChild(style);
}

export const GreetingText = () => {
  const [greeting, setGreeting] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");

  const getGreeting = () => {
    setGreeting(`Hey there, ${firstName}!`);
  };

  useEffect(() => {
    const fetchUserInfo = () => {
      if (!window.ipcRenderer) return;
      window.ipcRenderer.send("get-user-info");
      window.ipcRenderer.once("backend-response", (_, response) => {
        setFirstName(response.displayName.split(" ")[0]);
      });
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    getGreeting();
  });

  // ----------------------------------- //
  return (
    <div
      className="w-full pb-5 flex flex-col items-center font-cormorant
       text-gray-900 dark:text-gray-200 lg:text-5xl text-4xl font-medium"
    >
      <div className="mb-8 relative scale-80">
        <div
          className="relative w-[140px] h-[140px] grid"
          style={{
            gridTemplateColumns: "repeat(14,1fr)",
            gridTemplateRows: "repeat(14,1fr)",
            gridColumnGap: "0px",
            gridRowGap: "0px",
            gridTemplateAreas: `
              "a1  a2  a3  a4  a5  top0  top0  top0  top0  a10 a11 a12 a13 a14"
              "b1  b2  b3  top1 top1 top1 top1 top1 top1 top1 top1 b12 b13 b14"
              "c1 c2 top2 top2 top2 top2 top2 top2 top2 top2 top2 top2 c13 c14"
              "d1 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 d14"
              "e1 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 e14"
              "f1 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 f14"
              "top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4"
              "top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4"
              "top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4"
              "top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4"
              "top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4"
              "top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4"
              "st0 st0 an4 st1 an7 st2 an10 an10 st3 an13 st4 an16 st5 st5"
              "an1 an2 an3 an5 an6 an8 an9 an9 an11 an12 an14 an15 an17 an18"
            `,
            ...upNDown,
          }}
        >
          {/* Pupils */}
          <div
            className="absolute w-5 h-5 bg-black z-10"
            style={{ top: 50, left: 10, borderRadius: "50%", ...eyesMovement }}
          ></div>
          <div
            className="absolute w-5 h-5 bg-black z-10"
            style={{ top: 50, right: 50, borderRadius: "50%", ...eyesMovement }}
          ></div>
          {/* Eyes */}
          <div
            className="absolute"
            style={{ width: 40, height: 50, top: 30, left: 10 }}
          >
            <div
              className="absolute bg-white"
              style={{ width: 20, height: 50, transform: "translateX(10px)" }}
            ></div>
            <div
              className="absolute bg-white"
              style={{ width: 40, height: 30, transform: "translateY(10px)" }}
            ></div>
          </div>
          <div
            className="absolute"
            style={{ width: 40, height: 50, top: 30, right: 30 }}
          >
            <div
              className="absolute bg-white"
              style={{ width: 20, height: 50, transform: "translateX(10px)" }}
            ></div>
            <div
              className="absolute bg-white"
              style={{ width: 40, height: 30, transform: "translateY(10px)" }}
            ></div>
          </div>
          {/* Ghost body parts */}
          <div
            style={{ gridArea: "top0", backgroundColor: "rgb(130,35,220)" }}
          ></div>
          <div
            style={{ gridArea: "top1", backgroundColor: "rgb(130,35,220)" }}
          ></div>
          <div
            style={{ gridArea: "top2", backgroundColor: "rgb(130,35,220)" }}
          ></div>
          <div
            style={{ gridArea: "top3", backgroundColor: "rgb(130,35,220)" }}
          ></div>
          <div
            style={{ gridArea: "top4", backgroundColor: "rgb(130,35,220)" }}
          ></div>
          <div
            style={{ gridArea: "st0", backgroundColor: "rgb(130,35,220)" }}
          ></div>
          <div
            style={{ gridArea: "st1", backgroundColor: "rgb(130,35,220)" }}
          ></div>
          <div
            style={{ gridArea: "st2", backgroundColor: "rgb(130,35,220)" }}
          ></div>
          <div
            style={{ gridArea: "st3", backgroundColor: "rgb(130,35,220)" }}
          ></div>
          <div
            style={{ gridArea: "st4", backgroundColor: "rgb(130,35,220)" }}
          ></div>
          <div
            style={{ gridArea: "st5", backgroundColor: "rgb(130,35,220)" }}
          ></div>
          {/* Animated flicker parts */}
          <div style={{ gridArea: "an1", ...flicker0 }}></div>
          <div style={{ gridArea: "an2", ...flicker1 }}></div>
          <div style={{ gridArea: "an3", ...flicker1 }}></div>
          <div style={{ gridArea: "an4", ...flicker1 }}></div>
          <div style={{ gridArea: "an5" }}></div>
          <div style={{ gridArea: "an6", ...flicker0 }}></div>
          <div style={{ gridArea: "an7", ...flicker0 }}></div>
          <div style={{ gridArea: "an8", ...flicker0 }}></div>
          <div style={{ gridArea: "an9", ...flicker1 }}></div>
          <div style={{ gridArea: "an10", ...flicker1 }}></div>
          <div style={{ gridArea: "an11", ...flicker0 }}></div>
          <div style={{ gridArea: "an12", ...flicker0 }}></div>
          <div style={{ gridArea: "an13", ...flicker0 }}></div>
          <div style={{ gridArea: "an14" }}></div>
          <div style={{ gridArea: "an15", ...flicker1 }}></div>
          <div style={{ gridArea: "an16", ...flicker1 }}></div>
          <div style={{ gridArea: "an17", ...flicker1 }}></div>
          <div style={{ gridArea: "an18", ...flicker0 }}></div>
        </div>
        <div
          className="absolute bg-black rounded-full"
          style={{
            width: 140,
            height: 140,
            top: "80%",
            left: 0,
            right: 0,
            margin: "auto",
            filter: "blur(20px)",
            transform: "rotateX(80deg)",
            ...shadowMovement,
          }}
        ></div>
      </div>
      {greeting}
    </div>
  );
};
