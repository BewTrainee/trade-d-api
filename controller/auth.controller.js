const pool = require("../database/index")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const authController = {
    register: async (req, res) => {
        try {
            const { email, password, name } = req.body
            const [user, ] = await pool.query("select * from users where email = ?", [email])
            if (user[0]) return res.json({ error: "Email already exists!" })
            

            const hash = await bcrypt.hash(password, 10)

            const sql = "insert into users (email, password, name) values (?, ?, ?)"
            const [rows, fields] = await pool.query(sql, [email, hash, name])

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
            const { username, password } = req.body;
            const last_ip = extractIPv4(req.ip);
            
            // Call your authentication procedure and get user data
            const [user] = await pool.query("CALL Auth(?,?,?);", [username, password, last_ip]);
            
            if (!user[0]) {
                return res.json({ error: "Invalid email or password!" });
            }
            // const has = await bcrypt.hash(password, 10)
            // console.log(has)
            // const { password: hash, uid, username } = has;

            // Compare the provided password with the hashed password from the database
            // const passwordMatch = await bcrypt.compare(password, hash);
            const getPassword = await user[0]
            const passwordMatch = await getPassword[0].password
            // console.log(passwordMatch)

            if (passwordMatch) {
                // Generate a JWT token for authentication (uncomment this section if needed)
                // const accessToken = jwt.sign({ userId: id }, 'your-secret-key', { expiresIn: '1h' });
                // return res.json({ 
                //     accessToken,
                //     data: { 
                //         userId: uid,
                //         username,
                //         // email
                //     }
                // });
                
                return res.json(user[0])
            } else {
                return res.json({ error: "Invalid password!" });
            }
            return res.json(user[0])
            
        } catch (error) {
            console.error(error);
            res.json({ error: error.message });
        }
    },
}
function extractIPv4(ipWithPrefix) {
    if(ipWithPrefix.startsWith('::ffff:')) {
      return ipWithPrefix.replace('::ffff:','');
    }
    return ipWithPrefix;
  }
module.exports = authController