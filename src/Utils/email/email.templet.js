export default function OTP_Templet({ Email, OTP, subject }) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>OTP Verification</title>
    <style>
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      body {
        font-family: Arial, sans-serif;
        background: linear-gradient(135deg, #2a0000, #7a0b0b 40%, #b81212);
        padding: 24px;
      }
      .wrapper {
        max-width: 560px;
        margin: 0 auto;
        background: #fff5f5;
        border: 1px solid #ffb3b3;
        border-radius: 18px;
        overflow: hidden;
        box-shadow: 0 12px 30px rgba(120, 0, 0, 0.25);
      }
      .header {
        background: radial-gradient(circle at top right, #ff4d4d, #a30000);
        color: #ffffff;
        padding: 24px;
        text-align: center;
      }
      .header h1 {
        font-size: 24px;
        letter-spacing: 0.6px;
      }
      .content {
        padding: 26px 24px 30px;
        color: #3d0a0a;
        text-align: center;
      }
      .email {
        margin-top: 12px;
        color: #8f1111;
        font-weight: bold;
      }
      .otp-box {
        margin: 22px auto;
        width: fit-content;
        background: #fff;
        border: 2px dashed #d61b1b;
        border-radius: 12px;
        padding: 14px 26px;
        font-size: 34px;
        font-weight: 700;
        letter-spacing: 8px;
        color: #b10000;
      }
      .note {
        margin-top: 10px;
        color: #7f2a2a;
        font-size: 14px;
      }
      .footer {
        padding: 14px;
        text-align: center;
        font-size: 12px;
        color: #a33a3a;
        background: #ffe6e6;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="header">
        <h1>${subject}</h1>
      </div>
      <div class="content">
        <p>Hello,</p>
        <p class="email">${Email}</p>
        <p style="margin-top: 16px;">Use this OTP to complete your verification:</p>
        <div class="otp-box">${OTP}</div>
        <p class="note">This code is confidential. Do not share it with anyone ,<br/> this code well be invalid after 30m</p>
      </div>
      <div class="footer">Sra7a App Security Mail</div>
    </div>
  </body>
</html>`;
}
