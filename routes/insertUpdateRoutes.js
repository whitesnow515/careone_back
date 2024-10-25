const express = require('express');
const router = express.Router();
const sql = require('mssql');
const config = require('../dbConfig');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Set up your SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// POST route for inserting data
router.post('/saveData', async (req, res) => {  
  console.log("start !!!");
  const { lastName, firstName, email, phone } = req.body;

  // Step 2: Validate required fields
  if (!lastName || !email || !phone) {
    return res.status(400).send('LastName, Email, and Phone are required.');
  }

  // Step 3: Format the date
  const formattedDateAdded = formatDate(new Date()); // Implement the formatDate function

  // Step 4: Set consent to 1 if checked, else return error
  const consentValue = '1';

  // Step 5: Set status and hidden to blank (empty string)
  const status = '';
  const hidden = '';

  try {
    // Step 6: Connect to the database
    await sql.connect(config);

    // Step 7: Check if the row already exists
    const result = await sql.query`
      SELECT * FROM PatientApplicants 
      WHERE LastName = ${lastName} AND FirstName = ${firstName} AND Email = ${email}
    `;

    if (result.recordset.length > 0) {
      // Step 8: If the record exists, update Phone and DateAdded
      await sql.query`
        UPDATE PatientApplicants
        SET Phone = ${phone}, DateAdded = ${formattedDateAdded}
        WHERE LastName = ${lastName} AND FirstName = ${firstName} AND Email = ${email}
      `;
      return res.send('Patient record updated successfully.');
    } else {
      // Step 9: If the record does not exist, insert a new row
      await sql.query`
        INSERT INTO PatientApplicants (LastName, FirstName, Email, Phone, Consent, DateAdded, Status, Hidden)
        VALUES (${lastName}, ${firstName}, ${email}, ${phone}, ${consentValue}, ${formattedDateAdded}, ${status}, ${hidden})
      `;
      return res.send('New patient record added successfully.');
    }
  } catch (err) {
    console.error('SQL error: ', err);
    res.status(500).send('Server Error');
  }
});

router.post('/saveBrokerData', async (req, res) => {  
  console.log("start Broker !!!");
  const { lastName, firstName, email, phone, broker_first_name, broker_last_name, broker_email, agent_number, broker_phone_number, dob, medicare_number } = req.body;

  // Step 2: Validate required fields
  if (!lastName || !email || !phone) {
    return res.status(400).send('LastName, Email, and Phone are required.');
  }

  // Step 3: Format the date
  const formattedDateAdded = formatDate(new Date()); // Implement the formatDate function

  // Step 4: Set consent to 1 if checked, else return error
  const consentValue = '1';

  // Step 5: Set status and hidden to blank (empty string)
  const status = '';
  const hidden = '';

  try {
    // Step 6: Connect to the database
    await sql.connect(config);

    // Step 7: Check if the row already exists
    const result = await sql.query`
      SELECT * FROM PatientApplicants 
      WHERE LastName = ${lastName} AND FirstName = ${firstName} AND Email = ${email} AND BrokerLastName = ${broker_last_name} AND BrokerFirstName = ${broker_first_name} AND BrokerEmail = ${broker_email}
    `;

    if (result.recordset.length > 0) {
      // Step 8: If the record exists, update Phone and DateAdded
      await sql.query`
        UPDATE PatientApplicants
        SET Phone = ${phone}, DateAdded = ${formattedDateAdded}, BrokerPhone = ${broker_phone_number}, DOB = ${dob}, MedicareNumber = ${medicare_number}
        WHERE LastName = ${lastName} AND FirstName = ${firstName} AND Email = ${email} AND BrokerLastName = ${broker_last_name} AND BrokerFirstName = ${broker_first_name} AND BrokerEmail = ${broker_email}
      `;
      return res.send('Patient record updated successfully.');
    } else {
      // Step 9: If the record does not exist, insert a new row
      await sql.query`
        INSERT INTO PatientApplicants (LastName, FirstName, Email, Phone, Consent, DateAdded, Status, Hidden, MedicareNumber, BrokerNumber, BrokerLastName, BrokerFirstName, BrokerEmail, BrokerPhone, DOB)
        VALUES (${lastName}, ${firstName}, ${email}, ${phone}, ${consentValue}, ${formattedDateAdded}, ${status}, ${hidden}, ${medicare_number}, ${agent_number}, ${broker_last_name}, ${broker_first_name}, ${broker_email}, ${broker_phone_number}, ${dob})
      `;
      return res.send('New patient record added successfully.');
    }
  } catch (err) {
    console.error('SQL error: ', err);
    res.status(500).send('Server Error');
  }
});

router.post('/send-email', async (req, res) => { 
  const { lastName, firstName, email, phone, broker_first_name, broker_last_name, broker_email, agent_number, broker_phone_number, dob, medicare_number } = req.body;
  const patientText = (
    `
      <p>Dear ${firstName} ${lastName}</p><br></br>
      <p>Your Medicare Insurance Agent, ${broker_first_name} ${broker_last_name}, has sent you a link that will allow you to enroll in
      a Medicare approved preventative wellness program. This program gives you access to
      preventative health services that can help you improve your health and lifestyle significantly.
      Our clinical team will explain the program fully to you and answer all of your questions as well as
      schedule you for your preventative health screening.</p><br></br>
      <p>Please <a href="https://www.welltrackone.com/web-patients">click here</a> to enroll in the program and you’ll be contacted by one of our clinical team
      right away.</p><br></br>
      <p>Thank you,</p><br></br>
      <p>On behalf of ${broker_first_name} ${broker_last_name}</p><br></br>
    `
  );

  const brokerText = (
    `
      <p>Thank you for submitting your client – ${firstName} ${lastName}</p>
    `
  )
  const msg_broker = {
    to: broker_email,
    from: 'info@careone-concierge.com', // Use a verified email address
    subject: 'Invite',
    html: brokerText,
  };

  const msg_patient = {
    to: email,
    from: 'info@careone-concierge.com', // Use a verified email address
    subject: 'Invite',
    html: patientText,
  };

  try {
    await sgMail.send(msg_patient);
    await sgMail.send(msg_broker);
    res.status(200).send('Email sent successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error sending email');
  }
});

router.get('/test', async (req, res) => { 
  console.log("Successful !!!");
  return res.send("Successful !!!");  
});

// Utility function to format the date to yyyy-mm-dd hh:mm:ss
function formatDate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`; // Format as YYYY-MM-DD HH:mm:ss
}


module.exports = router;
