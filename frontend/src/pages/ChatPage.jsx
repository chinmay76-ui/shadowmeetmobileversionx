import { useEffect, useState } from "react";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser || !targetUserId) return;

      // Prevent chatting with yourself
      if (authUser._id === targetUserId) {
        toast.error("Cannot chat with yourself");
        setLoading(false);
        return;
      }

      try {
        console.log("Initializing stream chat client...");
        console.log("DEBUG - authUser._id:", authUser._id);
        console.log("DEBUG - targetUserId:", targetUserId);
        console.log("DEBUG - tokenData.token:", tokenData.token);
        console.log("DEBUG - tokenData.token length:", tokenData.token?.length);

        const client = StreamChat.getInstance(STREAM_API_KEY);

        // Disconnect previous connection before connecting new user
        if (client.userID) {
          console.log("Disconnecting previous user:", client.userID);
          await client.disconnectUser();
        }

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        // Create unique member list (no duplicates)
        const uniqueMembers = [...new Set([authUser._id, targetUserId])];
        const channelId = [authUser._id, targetUserId].sort().join("-");

        const currChannel = client.channel("messaging", channelId, {
          members: uniqueMembers,
        });

        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [tokenData, authUser, targetUserId]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });

      toast.success("Video call link sent successfully!");
    }
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-dvh sm:h-[calc(100vh-4rem)] w-full bg-base-100">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full h-full flex flex-col relative">
            <CallButton handleVideoCall={handleVideoCall} />
            <Window>
              <div className="flex flex-col h-full">
                <div className="flex-shrink-0">
                  <ChannelHeader />
                </div>
                <div className="flex-1 min-h-0 overflow-hidden">
                  <MessageList />
                </div>
                <div className="flex-shrink-0">
                  <MessageInput focus />
                </div>
              </div>
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;
