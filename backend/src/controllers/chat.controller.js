import { generateStreamToken } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    // DEBUG LOGS
    console.log("getStreamToken called for user:", req.user.id);

    const token = generateStreamToken(req.user.id);

    // DEBUG LOG
    console.log(
      "Generated token:",
      token.substring(0, 20) + "..." + " (length: " + token.length + ")"
    );

    res.status(200).json({ token });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
