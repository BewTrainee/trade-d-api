const pool = require("../database/index");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UserDataDummy = {
    "email" : "test1@test.com",
    "password": "123456", 
    "name" : "NewDB User1",
    "gender" : "male",
    "phone" : "064-0081644",
    "location" : "จันทบุรี เมืองจัน 22000"
}


const authController = {
    register: async (req, res) => {
        try {
            const { email, password, name, gender, phone, location } = req.body
            const [user, ] = await pool.query("select * from users where email = ?", [email])
            if (user[0]) return res.json({ error: "Email already exists!" })
            

            const hash = await bcrypt.hash(password, 10)

            const sql = "insert into users (email, password, name, gender, phone, location ) values (?, ?, ?, ?, ?, ?)"
            const [rows, fields] = await pool.query(sql, [email, hash, name, gender, phone, location])

            if (rows.affectedRows) {
                return res.json({ message: "Ok" })
            } else {
                return res.json({ error: "Error" })
            }
            
        } catch (error) {
            console.log(error)
            res.json({
                error: error.message
            })
        }
    },
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const last_ip = extractIPv4(req.ip);

      // Call your authentication procedure and get user data
      const [user, ] = await pool.query("select * from users where email = ?", [email])
      

      if (!user[0]) {
        // User not found
        return res.status(401).json({ error: "Invalid email or password!" });
      }

      const { password: hash, user_id, name } = user[0];
    //   console.log(hash)
      const [userInfo, ] = await pool.query("CALL Auth(?,?,?);", [
        email,
        hash,
        last_ip,
      ]);

      const check = await bcrypt.compare(password, hash);
      if (check) {
        const accessToken = jwt.sign({ userId: user_id }, "3812932sjad34&*@", {
          expiresIn: "1h",
        });
        // return res.json({
        //   accessToken,
        //   data: {
        //     userId: user_id,
        //     name,
        //     email,
        //   },
        // });
        console.log("Success")
        return res.json(userInfo[0])
      }

      return res.status(401).json({ error: "Wrong password!" });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
  ForgetPasswordEmailCheck: async (req, res) => {
    try {
      const { email, phone } = req.body;
  
      // Check if email and phone are provided
      if (!email || !phone) {
        return res.status(400).json({ status: "error", message: "Email and phone are required." });
      }
  
      const result = await pool.query("SELECT email FROM users WHERE email = ? AND phone = ?", [email, phone]);
  
      // Check if the result array is not empty
      if (result[0].length > 0) {
        return res.json({ status: "success", email: result[0][0].email });
      } else {
        return res.status(404).json({ status: "error", message: "User not found." });
      }
    } catch (error) {
      console.error("Error in ForgetPasswordEmailCheck:", error);
      return res.status(500).json({ status: "error", message: "Internal server error." });
    }
  },
  
  ChangePassword: async (req,res) => {
    try {
      const {email,password} = req.body
      const hashPassword = await bcrypt.hash(password, 10)

      await pool.query("UPDATE users SET password = ? WHERE email = ? ",[hashPassword,email])

      res.json({ 
        status: "success",
        message:'Password changed'
      })
    } catch (error) {
      console.error(error);
      res.json({ error: error.message });
    }
  }
};


function extractIPv4(ipWithPrefix) {
  if (ipWithPrefix.startsWith("::ffff:")) {
    return ipWithPrefix.replace("::ffff:", "");
  }
  return ipWithPrefix;
}
module.exports = authController;
