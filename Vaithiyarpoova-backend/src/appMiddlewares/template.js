const otp_template = ({ payload }) => {
    return {
      subject: 'Email Verification Code',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification Code</title>
            <style>
                body { font-family: 'Montserrat', sans-serif; background-color: #F4F4F4; margin: 0; padding: 0; color: #333; }
                .email-container { max-width: 480px; margin: 0 auto; background-color: #FFFFFF; padding: 20px; border-radius: 10px; border: 1px solid rgb(226, 226, 226); box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                .email-header { text-align: center; padding-bottom: 15px; }
                .email-header img { height: 50px; }
                .email-body { padding: 20px; text-align: center; }
                .otp { font-size: 2.5em; background-color: #0B622F; padding: 3px 35px; border-radius: 10px; display: inline-block; margin: 20px 0; color: #FFFFFF; font-weight: bold; letter-spacing: 0.1em; }
                .email-footer { text-align: center; font-size: 14px; color: #0B622F; padding: 15px 0 10px; border-top: 1px solid #E0E0E0; }
                .custom-color { color: #0B622F; font-weight: 600; }
                @media (max-width: 600px) {
                    .email-container { padding: 15px; }
                    .otp { font-size: 2em; padding: 15px; }
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="email-header">
                    <img src="https://s3.ap-south-1.amazonaws.com/awsimages.imagesbazaar.com/900x600/21183/399-SM1106196.jpg" alt="Logo">
                </div>
                <div class="email-body">
                    <h2>Welcome to Vaithiyar Poova</h2>
                    <p>Here is your One Time Password (OTP) to verify your account:</p>
                    <div class="otp"><strong>${payload.otp}</strong></div>
                    <p>Please use this OTP to complete your verification process.</p>
                </div>
                <div class="email-footer">
                    <p>&copy; ${new Date().getFullYear()} Vaithiyar Poova. All rights reserved.</p>
                    <p class="custom-color">Fantom tech solution</p>
                </div>
            </div>
        </body>
        </html>`
    };
  };
  
  module.exports = { otp_template };
  