const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  "mongodb+srv://mihan:123@vetzil.j4oh8fz.mongodb.net/?retryWrites=true&w=majority";

let client;

async function connectToMongoDB() {
  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {
    // Connect the client to the server
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("vetzil").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    return client; // Return the MongoDB client after connection
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error; // Rethrow the error to handle it outside of this function
  }
}

async function getDataUsers(email, password) {
  try {
    await connectToMongoDB();
    // Access the database and collection
    const database = client.db("vetzil");
    const collection = database.collection("users");

    let query;
    if (password) {
      query = { email: email, password: password };
    } else {
      query = { email: email };
    }
    const cursor = collection.find(query);

    // Convert cursor to array
    const data = await cursor.toArray();
    if (!password) {
      // If password is null, extract only the email field from the data
      return data.map((entry) => ({ email: entry.email }));
    }

    return data;
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    throw error;
  }
}

async function addDataUsers(newData) {
  try {
    // Access the database and collection
    const database = client.db("vetzil");
    const collection = database.collection("users");

    // Insert the new data into the collection
    const result = await collection.insertOne(newData);
    console.log("Inserted new data with ID:", result.insertedId);

    return result;
  } catch (error) {
    console.error("Error adding data to MongoDB:", error);
    throw error;
  }
}

async function updateUserPassword(email, newPassword) {
  try {
    // Connect to MongoDB
    await connectToMongoDB();

    // Access the database and collection
    const database = client.db("vetzil");
    const collection = database.collection("users");

    // Find the user by email
    const query = { email: email };
    const user = await collection.findOne(query);

    if (!user) {
      throw new Error("User not found");
    }

    // Update user's password
    const result = await collection.updateOne(
      { _id: user._id },
      { $set: { password: newPassword } }
    );

    if (result.modifiedCount === 0) {
      throw new Error("Failed to update password");
    }

    console.log("Password updated successfully");

    return result;
  } catch (error) {
    console.error("Error updating user password:", error);
    throw error;
  }
}

async function getDataVet(email, password) {
  try {
    const database = client.db("vetzil");
    const collection = database.collection("vet");

    let query = {};
    let dataArray = [];

    if (email) {
      query = { email: email };
      const cursor = await collection.find(query); // Get the cursor for the query
      dataArray = await cursor.toArray();
    }
    if (email && password) {
      query = { email: email, password: password };
      const cursor = await collection.find(query); // Get the cursor for the query
      dataArray = await cursor.toArray();
    }

    return dataArray; // Return the dataArray
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    throw error;
  }
}

async function getDataVets() {
  try {
    // Access the database and collection
    const database = client.db("vetzil");
    const collection = database.collection("vet");

    // Find all documents
    const cursor = collection.find();

    // Convert cursor to array
    const data = await cursor.toArray();

    return data;
  } catch (error) {
    console.error("Error fetching data from MongoDB:", error);
    throw error;
  }
}

async function addDataVets(newData) {
  try {
    // Access the database and collection
    const database = client.db("vetzil");
    const collection = database.collection("vet");

    // Insert the new data into the collection
    const result = await collection.insertOne(newData);
    console.log("Inserted new data with ID:", result.insertedId);

    return result;
  } catch (error) {
    console.error("Error adding data to MongoDB:", error);
    throw error;
  }
}

async function updateVetPassword(email, newPassword) {
  try {
    // Connect to MongoDB
    await connectToMongoDB();

    // Access the database and collection
    const database = client.db("vetzil");
    const collection = database.collection("vet");

    // Find the user by email
    const query = { email: email };
    const user = await collection.findOne(query);

    if (!user) {
      throw new Error("Vet not found");
    }

    // Update user's password
    const result = await collection.updateOne(
      { _id: user._id },
      { $set: { password: newPassword } }
    );

    if (result.modifiedCount === 0) {
      throw new Error("Failed to update password");
    }

    console.log("Password updated successfully");

    return result;
  } catch (error) {
    console.error("Error updating vet password:", error);
    throw error;
  }
}

async function addDataPets(newData) {
  try {
    const database = client.db("petadaption");
    const collection = database.collection("pets");

    const result = await collection.insertOne(newData);
    console.log("Inserted new pet with ID:", result.insertedId);

    return result;
  } catch (error) {
    console.error("Error adding pet data to MongoDB:", error);
    throw error;
  }
}

async function getPetsData() {
  try {
    const database = client.db("petadaption"); // Update with your database name
    const collection = database.collection("pets"); // Update with your collection name

    // Fetch pets data
    const cursor = collection.find();

    // Convert cursor to array
    const petsData = await cursor.toArray();

    return petsData;
  } catch (error) {
    console.error("Error fetching pets data:", error);
    throw error;
  }
}

async function addAppointmentToAccept(appointmentData) {
  try {
    // Access the database and collection
    await connectToMongoDB();
    const database = client.db("appointment");
    const collection = database.collection("toAccept");

    // Insert the new data into the collection
    const result = await collection.insertOne(appointmentData);
    console.log("Inserted new appointment with ID:", result.insertedId);

    return result;
  } catch (error) {
    console.error("Error adding appointment data to MongoDB:", error);
    throw error;
  }
}

async function addAppointmentCurrent(vetEmail) {
  try {
    await connectToMongoDB();
    const database = client.db("appointment");
    const toAcceptCollection = database.collection("toAccept");
    const currentCollection = database.collection("current");

    // Retrieve all appointment data associated with the provided vetEmail from toAccept collection
    const appointmentsToAccept = await toAcceptCollection
      .find({ vetEmail: vetEmail })
      .toArray();

    if (appointmentsToAccept.length == 0) {
      throw new Error("No appointments to accept for the provided vetEmail");
    }

    // Insert the retrieved appointment data into the current collection
    await currentCollection.insertMany(appointmentsToAccept);

    // Delete all appointment data associated with the provided vetEmail from toAccept collection
    await toAcceptCollection.deleteMany({ vetEmail: vetEmail });

    return { message: "Appointments accepted successfully" };
  } catch (error) {
    console.error(
      "Error adding appointment data to current collection:",
      error
    );
    throw error;
  }
}

//User profile updating
async function updateUserData(
  PrevEmail,
  Fname,
  Lname,
  nameOfThePet,
  petType,
  gender,
  email,
  mobileNumber,
  password
) {
  try {
    // Connect to MongoDB
    await connectToMongoDB();

    // Access the database and collection
    const database = client.db("vetzil");
    const collection = database.collection("users");

    // Update user's data
    const result = await collection.updateOne(
      { email: PrevEmail },
      {
        $set: {
          Fname,
          Lname,
          nameOfThePet,
          petType,
          gender,
          email,
          mobileNumber,
          password,
        },
      }
    );

    if (result.modifiedCount === 0) {
      throw new Error("Failed to update user data");
    }

    console.log("User data updated successfully");

    return result;
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
}

async function updateVetData(
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
) {
  try {
    // Connect to MongoDB
    await connectToMongoDB();

    // Access the database and collection
    const database = client.db("vetzil");
    const collection = database.collection("vet");

    // Update user's data
    const result = await collection.updateOne(
      { email: prevEmail },
      {
        $set: {
          fullName,
          addressOfTheClinic,
          fieldOfExpertise,
          email,
          mobileNumber,
          password,
          clinic,
          lat,
          long,
        },
      }
    );

    if (result.modifiedCount === 0) {
      throw new Error("Failed to update user data");
    }

    console.log("User data updated successfully");

    return result;
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
}

async function getRecords(docEmail) {
  try {
    // Connect to MongoDB
    await connectToMongoDB();

    // Access "appointment" database and "toAccept" collection
    const database = client.db("appointment");
    const toAcceptCollection = database.collection("toAccept");

    // Retrieve all appointment data associated with the provided userEmail from toAccept collection
    const records = await toAcceptCollection
      .find({ vetEmail: docEmail })
      .toArray();

    if (records.length === 0) {
      throw new Error("No appointments found.");
    }

    return records;
  } catch (error) {
    console.error("Error retrieving appointment data:", error);
    throw error;
  }
}

async function getAppointment(userEmail) {
  try {
    // Connect to MongoDB
    await connectToMongoDB();

    // Access "appointment" database and "toAccept" collection
    const database = client.db("appointment");
    const toAcceptCollection = database.collection("toAccept");

    // Retrieve all appointment data associated with the provided userEmail from toAccept collection
    const appointments = await toAcceptCollection
      .find({ patientEmail: userEmail })
      .toArray();

    if (appointments.length === 0) {
      throw new Error("No appointments found.");
    }

    // Access "vetzil" database and "vet" collection
    const vetData = client.db("vetzil");
    const vetDatacollection = vetData.collection("vet");

    // Array to store combined data
    const combinedAppointments = [];

    for (const data of appointments) {
      const vet = await vetDatacollection
        .find({ email: data["vetEmail"] })
        .toArray();
      combinedAppointments.push({ appointment: data, vet: vet });
    }

    // Return the array of combined data
    return combinedAppointments;
  } catch (error) {
    console.error("Error retrieving appointment data:", error);
    throw error;
  }
}

async function addPastTreatments(treatmentData) {
  try {
    await connectToMongoDB();
    const database = client.db("vetzil");
    const pastTreatmentsCollection = database.collection("pastTreatments");

    const result = await pastTreatmentsCollection.insertOne(treatmentData);

    console.log("Treatment record added successfully:", result.insertedId);
    return result.insertedId;
  } catch (error) {
    console.error("Error adding past treatment record:", error);
    throw error;
  }
}
async function getPastTreatments(email) {
  try {
    await connectToMongoDB();

    const database = client.db("vetzil");
    const pastTreatmentsCollection = database.collection("pastTreatments");

    // Assuming email is a field in the pastTreatments documents
    const pastTreatments = await pastTreatmentsCollection
      .find({ email })
      .toArray();

    console.log("Past treatments retrieved successfully:", pastTreatments);

    return pastTreatments;
  } catch (error) {
    console.error("Error retrieving past treatments:", error);
    throw error;
  }
}
async function deleteUserAccount(email) {
  try {
    await connectToMongoDB();

    const database = client.db("vetzil");
    const users = database.collection("users");

    const result = await users.deleteOne({ email: email });

    return result;
  } catch (error) {
    console.error(`Error occured in account deletion : ${error}`);
  }
}
async function deleteVetAccount(email) {
  try {
    await connectToMongoDB();

    const database = client.db("vetzil");
    const vets = database.collection("vet");

    const result = await vets.deleteOne({ email: email });

    return result;
  } catch (error) {
    console.error(`Error occured in account deletion : ${error}`);
  }
}
module.exports = {
  connectToMongoDB,
  getDataUsers,
  addDataUsers,
  getDataVet,
  getDataVets,
  addDataVets,
  addDataPets,
  getPetsData,
  addAppointmentToAccept,
  addAppointmentCurrent,
  updateUserPassword,
  updateVetPassword,
  updateUserData,
  updateVetData,
  getAppointment,
  getRecords,
  addPastTreatments,
  getPastTreatments,
  deleteUserAccount,
  deleteVetAccount,
};
