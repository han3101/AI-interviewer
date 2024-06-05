This is a [Next.js](https://nextjs.org/) project hosted at [`Han's Interview Bot`](https://apriora-sprint.vercel.app/).

This is Han's AI Interviewer

## Technologies Used

- **Next.js**: A React framework enabling server-side rendering and static site generation for high-performance web applications.
- **Tailwind CSS**: A utility-first CSS framework for rapidly creating custom designs directly in your markup.
- **Shadcn**: Component/UI library for design

**Speech to Text Model**
[`WebkitSpeechRecognition by Mozilla and JS`](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API)

**Logic Model**
[`OpenAI gpt3.5turbo chat completion`](https://platform.openai.com/docs/guides/text-generation/chat-completions-api)

**Text to Speach Model**
[`Elevenlabs's Nichalia Schwartz`](https://elevenlabs.io/app/speech-synthesis)

**Cloudflare R2**
Use boto3 on python backend for all storage requirements

**FastAPI**
Used FastAPI's async and Background instances to run some heavy tasks in the background




## Walkthrough
A Walk Through of the app, head to [`Han's Interview Bot`](https://apriora-sprint.vercel.app/).
**UI may be a little laggy, please have some patience**

1. Click on [`Begin Interview on the root page`](https://apriora-sprint.vercel.app/dashboard/begin/)
2. Click on the Big Begin Interview button
    * This button will play a pre-recorded Intro which is most optimal and (saves money from unnecessary elevenlab credit burn)
    * This button will also call on the backend to clear out the cloudflare r2 bucket which stores interview data
3. Once redirected to the main dashboard, interact with the little mic to have a conversation with the AI Interviewer
    * If you leave the page by accident you can return to the [`Interview Dashboard`](https://apriora-sprint.vercel.app/dashboard/) and the Interviewer will remember the conversation
    * While the Interviewer is speaking, you can interrupt at anytime by clicking anywhere on the screen. You will be able to continue the conversation after
    * You can always discard your answer if you are not satisfied with the trash bin button
    * Lastly, you can end the interview anytime you want
4. Once you are satisfied with the interview you can hit the **End Interview** button and it will take you to the recordings landing page where you can rewatch your Interview
    * This button clears the Interviewers memory
    * This button also saves all the relevant Interview data which will be processed and shown to you in the recordings landing page
5. Lastly if you are done reviewing your interview and want to start a new one, click on the **begin interview** button
    * This button will redirect you to the [`Begin Interview on the root page`](https://apriora-sprint.vercel.app/dashboard/begin/) to start the cycle again.
    * The recording landing page consists of a table which shows your transcript, your audio and the AI's response corresponding to the timestamp of the conversation.


**What I would have done with more time resources**
1. To Lower Latency, current latency goes between 2.5-4s which is livable but noticeable:
    * Move to streaming inputs and outputs through websockets
    * Use a lower latency model or work to improve model through RAG or better tuning
    * Explore other options for storing and transporting big files such as supabase or Message Queues
2. Implement authentication and user sessions to enable scaling based on user_id and making Frontend more dynamic or multi-tenant, aka reduce the amount of hardcoding
3. Improve security by implementing API keys or user session, current implementation only has Https and Cors protection
4. Improve the Frontend and especially the recording landing page and adding more loading symbols as well as a waveform for AI's response as well

## Code Guide
**Frontend**
Majority of the logic for the frontend is in 
* [`recordAudio1.tsx`](https://github.com/han3101/apriora-sprint/blob/main/app/dashboard/(components)/recordAudio1.tsx)
* [`Recording Landing Page`](https://github.com/han3101/apriora-sprint/tree/main/app/dashboard/recording)
* [`Begin Interview Button`](https://github.com/han3101/apriora-sprint/blob/main/components/BeginInterviewButton.tsx)
* [`End Interview Button`](https://github.com/han3101/apriora-sprint/blob/main/components/EndInterviewButton.tsx)

**Backend**
Majority of the logic for the backend is in 
* Main.py
* interviewer.py

**Logistics**
Please feel free to drop me an email if the audio playback stops working as I have run out of elevenlab credits before