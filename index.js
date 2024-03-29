const express = require("express");
const { spawn } = require("child_process");
const {
  connectToMongoDB,
  getDataUsers,
  addDataUsers,
  getDataVets,
  getDataVet,
  addDataVets,
  addDataPets,
  getPetsData,
  addAppointmentToAccept,
  addAppointmentCurrent,
  getAppointment,
  updateUserPassword,
  updateVetPassword,
  updateUserData,
  updateVetData,
  getRecords,
  addPastTreatments,
  getPastTreatments,
  deleteUserAccount,
  deleteVetAccount,
} = require("./dataBase");

const bodyParser = require("body-parser");
const { sendEmail, sendEmailCustom } = require("./emailHandling");

const app = express();
module.exports = app;
const PORT = process.env.PORT || 3000;

// Parse application/x-www-form-urlencoded
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

// Parse application/json
app.use(bodyParser.json());

app.post("/dataGetUser", async (req, res) => {
  try {
    // Retrieve the email and password from the request body
    const { email, password } = req.body;

    // Connect to MongoDB and retrieve data
    const data = await getDataUsers(email, password);

    // Send the data as response
    res.json(data);
  } catch (error) {
    console.error("Error handling API request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/dataAddUser", async (req, res) => {
  try {
    // Retrieve the data parameters from the request
    const {
      Fname,
      Lname,
      nameOfThePet,
      petType,
      gender,
      email,
      mobileNumber,
      password,
    } = req.body;

    // Log the received data
    console.log("Received data:");
    console.log("First Name:", Fname);
    console.log("Last Name:", Lname);
    console.log("Name of the Pet:", nameOfThePet);
    console.log("Pet Type:", petType);
    console.log("Gender:", gender);
    console.log("Email:", email);
    console.log("Mobile Number:", mobileNumber);
    console.log("Password:", password);

    // Validate if all required fields are provided
    if (
      !Fname ||
      !Lname ||
      !nameOfThePet ||
      !petType ||
      !gender ||
      !email ||
      !mobileNumber ||
      !password
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Connect to MongoDB
    await connectToMongoDB();

    // Check if the data already exists
    const existingData = await getDataUsers(email, password);
    console.log("Existing data length:", existingData.length);
    if (existingData.length != 0) {
      return res.status(400).json({ error: "Data already exists" });
    }

    // Prepare the data object
    const newData = {
      Fname,
      Lname,
      nameOfThePet,
      petType,
      gender,
      email,
      mobileNumber,
      password,
    };

    // Add data to MongoDB
    const result = await addDataUsers(newData);

    // Send the result as response
    res.json({
      message: "Data added successfully",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("Error handling API request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/recoverMailCodeSend", async (req, res) => {
  const email = req.body.email;
  const recoveryCode = generateRandomCode().toString(); // Convert recovery code to string
  await sendEmail(email, recoveryCode);
  res.json(recoveryCode);
});

app.post("/changeEmailUser", async (req, res) => {
  const { email, password } = req.body;
  console.log(password);
  data = await updateUserPassword(email, password);
  res.send(data);
});

app.post("/dataGetVet", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email + " " + password);
    const db = await connectToMongoDB();
    const data = await getDataVet(email, password);

    // Send the data as response
    res.json(data);
  } catch (error) {
    console.error("Error handling API request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/dataGetVets", async (req, res) => {
  try {
    const db = await connectToMongoDB();
    const data = await getDataVets();

    res.json(data);
  } catch (error) {
    console.error("Error handling API request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/dataAddVet", async (req, res) => {
  try {
    // Retrieve the data parameters from the request
    const {
      fullName,
      addressOfTheClinic,
      fieldOfExpertise,
      email,
      mobileNumber,
      password,
    } = req.body;

    // Validate if all required fields are provided
    if (
      !fullName ||
      !addressOfTheClinic ||
      !fieldOfExpertise ||
      !email ||
      !mobileNumber ||
      !password
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Connect to MongoDB
    await connectToMongoDB();

    // Check if the data already exists
    const existingData = await getDataVet(email);
    if (existingData[0]) {
      return res.status(400).json({ error: "Data already exists" });
    }

    // Prepare the data object
    const newData = {
      fullName,
      addressOfTheClinic,
      fieldOfExpertise,
      email,
      mobileNumber,
      password,
    };

    // Add data to MongoDB
    const result = await addDataVets(newData);

    // Send the result as response
    res.json({
      message: "Data added successfully",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("Error handling API request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/changeEmailVet", async (req, res) => {
  const { email, password } = req.body;
  data = await updateVetPassword(email, password);
  res.send(data);
});

app.post("/addPet", async (req, res) => {
  try {
    const { name, description, contactNo, image } = req.body;

    if (!name || !description || !contactNo) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Prepare the data object
    const newPetData = {
      name,
      description,
      contactNo,
      image,
    };

    const result = await addDataPets(newPetData);

    res.json({
      message: "Pet added successfully",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("Error handling API request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/dataGetPets", async (req, res) => {
  try {
    await connectToMongoDB();
    const data = await getPetsData();

    // Send the data as response
    res.json(data);
  } catch (error) {
    console.error("Error handling API request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/bookAppointment", async (req, res) => {
  try {
    const { date, time, patientEmail, petType, vetEmail } = req.body;

    // Validate if all required fields are provided
    if (!date || !time || !patientEmail || !petType || !vetEmail) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    console.log(date);
    console.log(time);
    // Combine date and time into a single JavaScript Date object using UTC time zone
    const combinedDateTimeString = date + "T" + time + "Z";
    const combinedDateTime = new Date(combinedDateTimeString);
    console.log("time:" + combinedDateTimeString);
    console.log(combinedDateTime);
    // Prepare the appointment data object
    const appointmentData = {
      dateTime: combinedDateTime,
      patientEmail: patientEmail,
      petType: petType,
      vetEmail: vetEmail,
    };

    // Add appointment to the toAccept collection
    const result = await addAppointmentToAccept(appointmentData);

    // Send success response
    res.json({
      message: "Appointment booked successfully",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("Error handling API request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/acceptAppointment", async (req, res) => {
  try {
    const { vetEmail } = req.body;

    if (!vetEmail) {
      return res.status(400).json({ error: "Vet email is required" });
    }

    const result = await addAppointmentCurrent(vetEmail);
    res.json(result);
  } catch (error) {
    console.error("Error handling API request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/updateUserData", async (req, res) => {
  try {
    const {
      PrevEmail,
      Fname,
      Lname,
      nameOfThePet,
      petType,
      gender,
      email,
      mobileNumber,
      password,
    } = req.body;

    // Update user profile in the database
    const result = await updateUserData(
      PrevEmail,
      Fname,
      Lname,
      nameOfThePet,
      petType,
      gender,
      email,
      mobileNumber,
      password
    );

    // Send success response
    res.json({
      message: "User profile updated successfully",
      result: result,
    });
  } catch (error) {
    console.error("Error handling API request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/updateVetData", async (req, res) => {
  try {
    const {
      prevEmail,
      fullName,
      addressOfTheClinic,
      fieldOfExpertise,
      email,
      mobileNumber,
      password,
      clinic,
      lat,
      long,
    } = req.body;

    const result = await updateVetData(
      prevEmail,
      fullName,
      addressOfTheClinic,
      fieldOfExpertise,
      email,
      password,
      mobileNumber,
      clinic,
      lat,
      long
    );

    res.json({
      message: "Vet profile updated successfully",
      result: result,
    });
  } catch (error) {
    console.error("Error handling API request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/getAppointment", async (req, res) => {
  try {
    const { userEmail } = req.body;

    if (!userEmail) {
      return res.status(400).json({ error: "user Email email is required" });
    }

    const result = await getAppointment(userEmail);
    res.json(result);
  } catch (error) {
    console.error("Error handling API request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API endpoint to receive user inputs and get predictions
app.post("/predict", async (req, res) => {
  // Extract user inputs from request body
  const { Age, Temperature, Animal, Symptom1, Symptom2, Symptom3 } = req.body;

  // Execute Python script
  const pythonProcess = spawn("python", ["predict.py"], { stdio: "pipe" });

  // Send input data to the Python process
  const inputData = {
    Age: Age[0],
    Temperature: Temperature[0],
    Animal: Animal[0],
    Symptom1: Symptom1[0],
    Symptom2: Symptom2[0],
    Symptom3: Symptom3[0],
  };

  pythonProcess.stdin.write(JSON.stringify(inputData));
  pythonProcess.stdin.end();

  // Handle stdout data from the Python process
  let predictedDisease = "";
  let probability = "";

  pythonProcess.stdout.on("data", (data) => {
    const predictions = JSON.parse(data);
    predictedDisease = predictions.predictedDisease;
    probability = predictions.probability;
  });

  // Handle end of stdout data from the Python process
  pythonProcess.stdout.on("end", () => {
    // Send the predicted label to the frontend
    console.log(predictedDisease);
    console.log(probability);
    res.json({ predictedDisease, probability }); // Send predictions back to frontend
  });

  // Handle stderr data from the Python process
  pythonProcess.stderr.on("data", (data) => {
    console.error(`Python stderr: ${data}`);
    res.status(500).send("Error occurred"); // Send error response
  });

  // Handle Python process exit
  pythonProcess.on("close", (code) => {
    if (code !== 0) {
      console.error(`Python process exited with code ${code}`);
      res.status(500).send("Error occurred"); // Send error response
    }
  });
});

app.post("/getDocPassAppointment", async (req, res) => {
  try {
    const { docEmail } = req.body;
    console.log(docEmail);
    if (!docEmail) {
      return res.status(400).json({ error: "user doctor email is required" });
    }

    const result = await getRecords(docEmail);
    res.json(result);
  } catch (error) {
    console.error("Error handling API request:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/addPastTreatments", async (req, res) => {
  try {
    const { email, date, ownerName, petName, petType, description, image } =
      req.body;
    const treatmentData = {
      email: email,
      date: date,
      owner: {
        name: ownerName,
      },
      pet: {
        name: petName,
        type: petType,
      },
      description: description,
      image: image,
    };

    const insertedId = await addPastTreatments(treatmentData);

    res.status(200).json({
      success: true,
      message: "Treatment record added successfully",
      insertedId,
    });
  } catch (error) {
    console.error("Error adding past treatment record:", error);
    res.status(500).json({
      success: false,
      message: "Error adding past treatment record",
      error: error.message,
    });
  }
});
app.post("/getPastTreatments", async (req, res) => {
  try {
    const { doctorEmail } = req.body; // Retrieve email from query parameters

    if (!doctorEmail) {
      return res.status(400).json({
        success: false,
        message: "Email parameter is required.",
      });
    }

    const pastTreatments = await getPastTreatments(doctorEmail); // Call function to retrieve past treatments based on email

    res.json({
      pastTreatments,
    });
  } catch (error) {
    console.error("Error retrieving past treatments:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving past treatments",
      error: error.message,
    });
  }
});

app.post("/deleteUserAccount", async (req, res) => {
  const { email } = req.body;

  try {
    const response = await deleteUserAccount(email);
    if (response.deletedCount === 1) {
      res.status(200).send("User account deleted successfully.");
    } else {
      res.status(500).send("No user found.");
    }
  } catch (error) {
    console.error("Error deleting user account:", error);
    res.status(500).send("Error deleting user account.");
  }
});

app.post("/deleteVetAccount", async (req, res) => {
  const { email } = req.body;

  try {
    const response = await deleteVetAccount(email);
    if (response.deletedCount === 1) {
      res.status(200).send("Vet account deleted successfully.");
    } else {
      res.status(500).send("No vet found.");
    }
  } catch (error) {
    console.error("Error deleting vet account:", error);
    res.status(500).send("Error deleting vet account.");
  }
});

app.post("/sendEmail", async (req, res) => {
  const { email, msg, heading } = req.body;
  const data = await sendEmailCustom(email, msg, heading);
  res.send(data);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

function generateRandomCode() {
  const min = 1000;
  const max = 9999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
