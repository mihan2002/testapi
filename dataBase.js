const {
  connectToMongoDB,
  addDataUsers,
  getDataUsers,
  addDataVets,
  getDataVet,
  updateUserPassword,
  updateVetPassword,
  updateUserData,
  updateVetData,
  deleteVetAccount,
  deleteUserAccount
} = require("./dataBase.js");

describe("Database Functions", () => {
  // Mocking MongoDB connection
  beforeAll(async () => {
      await connectToMongoDB();
  });

  // Test case for addDataUsers function
  it("adds user data to MongoDB", async () => {
      const newData = {
          Fname: "John",
          Lname: "Doe",
          nameOfThePet: "bro",
          petType: "cat",
          gender: "male",
          email: "john1@example.com",
          mobileNumber: "0123456789",
          password: "password",
      };
      const result = await addDataUsers(newData);
      expect(result.insertedId).toBeDefined(); // Check if insertedId property exists
  });

  // Test case for getDataUsers function
  it("fetches user data from MongoDB", async () => {
      // Insert test data
      const testData = {
          Fname: "John",
          Lname: "Doe",
          nameOfThePet: "bro",
          petType: "cat",
          gender: "male",
          email: "john1@example.com",
          mobileNumber: "0123456789",
          password: "password",
      };
      await addDataUsers(testData);

      // Call getDataUsers function
      const userData = await getDataUsers("john1@example.com", "password");

      // Assert the result
      expect(userData.length).toBeDefined();
      expect(userData[0].Fname).toBe("John");
      expect(userData[0].Lname).toBe("Doe");
      expect(userData[0].nameOfThePet).toBe("bro");
      expect(userData[0].petType).toBe("cat");
      expect(userData[0].gender).toBe("male");
      expect(userData[0].email).toBe("john1@example.com");
      expect(userData[0].mobileNumber).toBe("0123456789");
      expect(userData[0].password).toBe("password");
  });

  // Additional test case for getDataUsers function with incorrect password
  it("returns empty array for incorrect password", async () => {
      // Insert test data
      const testData = {
          Fname: "Jane",
          Lname: "Smith",
          nameOfThePet: "snoopy",
          petType: "dog",
          gender: "female",
          email: "jane@example.com",
          mobileNumber: "9876543210",
          password: "secret",
      };
      await addDataUsers(testData);

      // Call getDataUsers function with incorrect password
      const userData = await getDataUsers("jane@example.com", "wrongpassword");

      // Assert the result
      expect(userData.length).toBe(0);
  });

  // Test case for addDataVets function
  it("adds vet data to MongoDB", async () => {
      // Define test data for a new vet
      const newVetData = {
          fullName: "Dr. Smith",
          adddressOfTheClinic: "123 place place st.",
          fieldOfExpertise: "Dermatology",
          email: "drsmith@example.com",
          mobilenumber: "123456789",
          password: "vetpassword",
          lat: 40.7128,
          long: -74.0060
      
      };

      // Call the addDataVets function with the test data
      const result = await addDataVets(newVetData);

      // Assert the result
      expect(result.insertedId).toBeDefined(); // Check if insertedId property exists
  });

  // Test case for getDataVet function
  it("fetches vet data from MongoDB", async () => {
      // Call getDataVet function with correct email and password
      const result = await getDataVet("drsmith@example.com", "vetpassword");

      // Assert the result
      expect(result[0].fullName).toBe("Dr. Smith"); // Check if the returned vet's name matches
      expect(result[0].fieldOfExpertise).toBe("Dermatology"); // Check if the returned vet's specialty matches
      // Add more assertions as needed to validate other properties
  });

  // Test case for getDataVet function with incorrect password
  it("returns empty array for incorrect password", async () => {
      // Call getDataVet function with incorrect email and password
      const result = await getDataVet("drsmith@example.com", "incorrectpassword");

      // Assert the result
      expect(result.length).toBe(0); // Check if the result is an empty array
  });

  // Test case for updateUserPassword function
  it("updates user password in MongoDB", async () => {
      
      // Call updateUserPassword function to update password
      const newPassword = "newpassword";
      const result = await updateUserPassword("john1@example.com", newPassword);

      
      // You can also fetch the user data again and verify if the password is updated correctly
      const updatedUserData = await getDataUsers("john1@example.com", newPassword);
      
      expect(updatedUserData[0].password).toBe(newPassword); // Check if the password is updated
  });

  // Test case for updateVetPassword function
  it("updates vet password in MongoDB", async () => {
      // Call updateVetPassword function to update password
      const newPassword = "newpassword1";
      const result = await updateVetPassword("drsmith@example.com", newPassword);

      // You can also fetch the vet data again and verify if the password is updated correctly
      const updatedVetData = await getDataVet("drsmith@example.com", newPassword);
      expect(updatedVetData[0].password).toBe(newPassword); // Check if the password is updated
  });

  // Test case for updateVetPassword function when vet is not found
  it("throws an error when vet is not found", async () => {
      // Attempt to update password for a vet that doesn't exist
      const email = "nonexistentvet@example.com";
      const newPassword = "newpassword";
      
      // Use try-catch block to catch the expected error
      try {
          await updateVetPassword(email, newPassword);
          // If the function does not throw an error, fail the test
          fail("Expected updateVetPassword to throw an error for non-existent vet");
      } catch (error) {
          // Assert that the error message matches the expected error message
          expect(error.message).toBe("Vet not found");
      }
  });

  it("updates user data in MongoDB", async () => {
      // Define test data for the existing user
      const prevEmail = "john1@example.com";
      const newData = {
          Fname: "John",
          Lname: "Doe",
          nameOfThePet: "newpetname",
          petType: "dog",
          gender: "male",
          email: "john1@example.com",
          mobileNumber: "0123456789",
          password: "newpassword",
      };

      // Call the updateUserData function with the test data
      const result = await updateUserData(
          prevEmail,
          newData.Fname,
          newData.Lname,
          newData.nameOfThePet,
          newData.petType,
          newData.gender,
          newData.email,
          newData.mobileNumber,
          newData.password
      );

      // Assert the result
      expect(result.modifiedCount).toBe(1); // Check if one document was modified

      // Fetch the updated user data
      const updatedUserData = await getDataUsers(newData.email, newData.password);

      // Assert that the updated data matches the new data
      expect(updatedUserData.length).toBe(1); // Check if one document is returned
      expect(updatedUserData[0]).toMatchObject(newData); // Check if the updated data matches the new data
  });

  it("updates vet data in MongoDB", async () => {
      // Define test data for an existing vet
      const prevEmail = "drsmith@example.com";
      const newData = {
          fullName: "Dr. John Smith",
          addressClinic: "456 New Street",
          fieldOfExpertise: "Surgery",
          email: "drsmith@example.com",
          mobileNumber: "9876543210",
          password: "newvetpassword",
          clinic: "New Clinic",
          lat: 40.7128,
          long: -74.0060
      };

      // Call the updateVetData function with the test data
      const result = await updateVetData(
          prevEmail,
          newData.fullName,
          newData.addressClinic,
          newData.fieldOfExpertise,
          newData.email,
          newData.password,
          newData.mobileNumber,
          newData.clinic,
          newData.lat,
          newData.long
      );

      // Assert the result
      expect(result.modifiedCount).toBe(1); // Check if one document was modified

      // Fetch the updated vet data
      const updatedVetData = await getDataVet(newData.email, newData.password);

      // Assert that the updated data matches the new data
      expect(updatedVetData.length).toBe(1); // Check if one document is returned
      expect(updatedVetData[0]).toMatchObject(newData); // Check if the updated data matches the new data
  });

  it("deletes a user account from MongoDB", async () => {
      // Define test data for an existing user to be deleted
      const email = "john1@example.com";

      // Call the deleteUserAccount function with the test data
      const result = await deleteUserAccount(email);

      // Assert the result
      expect(result.deletedCount).toBe(1); // Check if one document was deleted
  });

  it("deletes a vet account from MongoDB", async () => {
      // Define test data for an existing vet to be deleted
      const email = "drsmith@example.com";

      // Call the deleteVetAccount function with the test data
      const result = await deleteVetAccount(email);

      // Assert the result
      expect(result.deletedCount).toBe(1); // Check if one document was deleted
  });
});