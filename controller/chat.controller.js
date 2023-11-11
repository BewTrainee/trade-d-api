const pool = require("../database/index")

const chatController = {
    getChat : async (req,res) => {
        try {
            const { uid } = req.params
            const result = await pool.query("CALL GetChat(?);",[uid])
            res.json(result[0][0])
        } catch (error) {
            console.log(error)
            res.json({
                status: "error"
            })
        }
    },
    get_message: async (req,res) => {
        try {
            const { user_id,partner_id } = req.params
            const result = await pool.query
            ('SELECT * FROM chats WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)',[user_id, partner_id, partner_id, user_id])
            res.json(result[0])
        } catch (error) {
            console.log(error)
            res.json({
                status:"error"
            })
        }
    }
}
module.exports = chatController