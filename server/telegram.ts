export interface TelegramSubscriptionNotification {
  userName: string;
  username: string;
  userId: string;
  email: string;
  selectedPlan: string;
  price: number;
  duration: string;
  requestId: string;
  date: string;
  status: "PENDING";
}

export interface TelegramContactNotification {
  userId: string;
  username: string;
  name: string;
  requestType: string;
  message: string;
  date: string;
}

export async function sendTelegramMessage(text: string): Promise<{ success: boolean; error?: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!botToken || !chatId) {
    console.log("[Telegram] Bot Token or Chat ID not set. Notification recorded in server logs:");
    console.log(text);
    return { success: true }; // gracefully succeed in development or when not configured
  }

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
      console.error("[Telegram Error]", data);
      return { success: false, error: data.description || "Telegram API error" };
    }
    return { success: true };
  } catch (err: any) {
    console.error("[Telegram Request Failed]", err);
    return { success: false, error: err.message || "Network error sending telegram" };
  }
}

export async function notifyAdminSubscriptionRequest(
  payload: TelegramSubscriptionNotification
): Promise<{ success: boolean; error?: string }> {
  const message = `
🌟 <b>NEW SUBSCRIPTION REQUEST</b> 🌟
━━━━━━━━━━━━━━━━━━━━
👤 <b>User Name:</b> ${escapeHtml(payload.userName)}
🏷 <b>Username:</b> @${escapeHtml(payload.username)}
🆔 <b>User ID:</b> <code>${escapeHtml(payload.userId)}</code>
✉️ <b>Email:</b> ${escapeHtml(payload.email)}
━━━━━━━━━━━━━━━━━━━━
📦 <b>Selected Plan:</b> ${escapeHtml(payload.selectedPlan)}
💰 <b>Price:</b> $${payload.price}
⏱ <b>Duration:</b> ${escapeHtml(payload.duration)}
📋 <b>Request ID:</b> <code>${escapeHtml(payload.requestId)}</code>
📅 <b>Date:</b> ${payload.date}
📊 <b>Status:</b> <b>${payload.status}</b>
━━━━━━━━━━━━━━━━━━━━
<i>Action required: Please review and approve in Admin backend.</i>
`.trim();

  return sendTelegramMessage(message);
}

export async function notifyAdminContactMessage(
  payload: TelegramContactNotification
): Promise<{ success: boolean; error?: string }> {
  const message = `
📩 <b>USER SUPPORT / INQUIRY</b> 📩
━━━━━━━━━━━━━━━━━━━━
👤 <b>Name:</b> ${escapeHtml(payload.name)}
🏷 <b>Username:</b> @${escapeHtml(payload.username)}
🆔 <b>User ID:</b> <code>${escapeHtml(payload.userId)}</code>
📌 <b>Request Type:</b> ${escapeHtml(payload.requestType)}
📅 <b>Date:</b> ${payload.date}
━━━━━━━━━━━━━━━━━━━━
💬 <b>Message:</b>
${escapeHtml(payload.message)}
━━━━━━━━━━━━━━━━━━━━
`.trim();

  return sendTelegramMessage(message);
}

function escapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
