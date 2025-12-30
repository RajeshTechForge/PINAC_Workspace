<div align="center">

<img src="https://github.com/RajeshTechForge/PINAC_Workspace/blob/main/assets/header_2.png" alt="header image">

<br>
<br>

<img alt="Github Contributors" src="https://img.shields.io/github/contributors/RajeshTechForge/PINAC_Workspace"/>
<img alt="GitHub closed issues" src="https://img.shields.io/github/issues-closed/RajeshTechForge/PINAC_Workspace"/>

[![View My Profile](https://img.shields.io/badge/View-My_Profile-blue?logo=GitHub)](https://github.com/rajeshtechforge)

A privacy-first, cross-platform, open-source desktop AI assistant for all

<br>

![](https://skillicons.dev/icons?i=react,tailwindcss,typescript,vite,electron,python)

</div>

<br />

## PINAC Workspace

PINAC Workspace is a modern-looking _privacy-first_ AI chat for desktops, seamlessly blending Electron-React for a modern user experience with powerfully Python backend. Unlock the full potential of AI with unparalleled simplicity and user-friendliness, while enjoying ultimate freedom and privacy.

## ✨ Features

- **Total Freedom:** Choose between local (Ollama) and cloud (Pinac-Cloud) AI models to suit your workflow and privacy needs.
- **Privacy by Design:** No personal data is ever shared or stored on our servers. All features work fully offline, ensuring your data stays on your device.
- **Local RAG Integration:** Attach documents directly in chat and leverage a lightweight, local Retrieval-Augmented Generation (RAG) model. Optionally, plug in your own RAG model for advanced use cases.
- **Real-Time Web Search:** Instantly access up-to-date information from the web to answer questions and enhance conversations.
- **Secure Authentication:** Sign in and out securely with Firebase Authentication, protecting your identity and access.
- **Local Chat History:** All conversations are stored locally for your privacy and convenience. Easily revisit and refine past chats.
- **Modern Desktop Experience:** Enjoy a sleek, responsive UI built with Electron and React, powered by a robust Python backend.

## 🛹 UI-Design

<img src="https://github.com/RajeshTechForge/PINAC_Workspace/blob/main/assets/UI-Design.png" alt="app screenshot">

## 🗼 System Design

<img src="https://github.com/RajeshTechForge/PINAC_Workspace/blob/main/assets/system_architechture.png" alt="system design">

> [!NOTE]
> You can find the microservice code (ready to be deployed to the cloud and used as required services) in the following repository:
> [RajeshTechForge/PINAC_Microservices](https://github.com/RajeshTechForge/PINAC_Microservices)

## 📂 File Structure

Overview of File Structure in Brief to Help You Get Started.

      .
      ├── index.html
      ├── public/
      ├── electron/
      |
      ├── backend/
      |   ├── auth/
      |   ├── utils/
      |   ├── models/
      |   ├── rag/
      |   ├── app.py
      |   ├── app.spec
      |   ├── build_app.py
      |   ├── custom_types.py
      |   └── requirements.txt
      |
      └── src/
          ├── App.tsx
          ├── index.css
          ├── index.tsx
          ├── components/
          │   ├── FrameHeader.tsx
          │   ├── GreetingText.tsx
          │   ├── MarkdownRenderer.tsx
          │   └── ModalBox.tsx
          │
          ├── context/
          │   ├── Attachment.tsx
          │   ├── Authentication.tsx
          │   ├── ChatMsg.tsx
          │   ├── EmbeddingSettings.tsx
          |   ├── ModalBox.tsx
          │   ├── ModelSettings.tsx
          │   ├── OllamaSettings.tsx
          │   ├── SettingsProvider.ts
          │   ├── StopTextGeneration.ts
          │   ├── themeManager.ts
          │   └── WelcomeText.tsx
          │
          ├── features/
          │   ├── appSettings/
          │   ├── sidebar/
          │   ├── chatHistory/
          │   ├── chatInput/
          │   ├── database/
          │   └── messageBubble/
          │
          └── pages/
              ├── Home.tsx
              └── SignIn.tsx

## 🚀 Getting Started

> [!NOTE]  
> Make sure Ollama is installed in your system

1. Clone the Repository

   ```bash
   git clone https://github.com/RajeshTechForge/PINAC_Workspace.git && cd PINAC_Workspace
   ```

2. Install Node dependencies

   ```bash
   npm install
   ```

3. Create a Python Env for running backend

   ```bash
   cd backend && python -m venv venv
   ```

4. Install Python dependencies

   ```bash
   # Activate the virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate

   pip install -r requirements.txt
   ```

5. Start the App  
   (For regular time usage, no need to start the Python env or backend file separately)
   ```bash
   npm run dev
   ```

   If want to build the app for production, just run `npm run build`

## 🎉 Contributing

We highly welcome contributions! Please follow the steps if you're interested.

1. Star this repository
2. Fork the repository on GitHub.
3. Clone the project to your machine.
4. Create your own branch.
5. Commit changes to your branch.
6. Push your work back up to your fork.
7. Submit a Pull request so that we can review your changes

## 📄 License

PINAC Workspace is licensed under the **GPL-3.0 license**. See the <a href="https://github.com/RajeshTechForge/PINAC_Workspace/blob/main/LICENSE">LICENSE</a> file for more details.

## 🌏 Contributors

Thanks to our contributors, we have received huge support from the open-source community.

<a href="https://github.com/RajeshTechForge/PINAC_Workspace/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=RajeshTechForge/PINAC_Workspace" />
</a>
