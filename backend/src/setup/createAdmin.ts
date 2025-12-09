import User from "../models/User";
import bcrypt from "bcryptjs";

export async function createDefaultAdmin() {
  try {
    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("✔ Admin already exists:", existingAdmin.email);
      return;
    }

    const password = "Admin1234"; // default admin password
    const passwordHash = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name: "Default Admin",
      email: "admin@demo.com",
      passwordHash,
      role: "admin"
    });

    console.log("🚀 Default admin created:");
    console.log("Email: admin@demo.com");
    console.log("Password: Admin1234");
  } catch (error) {
    console.error("❌ Error creating default admin:", error);
  }
}
