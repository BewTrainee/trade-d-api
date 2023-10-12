const path = require("path")
const pool = require("../database/index")



// const postsController =  {
module.exports = () => {
    return {
        getAll: async (req, res) => {
            try {
                // const result = await pool.query("select posts.*,p.name,p.lastname,p.avatar from posts posts RIGHT JOIN profile p ON posts.uid = p.uid order by create_at DESC")
                const result = await pool.query("call AllPostToCard();")
                const data = result[0]
                res.json(data[0])
            } catch (error) {
                console.log(error)
                res.json({
                    status: "error"
                })
            }
        },
        getById: async (req, res) => {
            try {
                const { id } = req.params
                const result = await pool.query("SELECT p.post_id,p.content FROM posts p where post_id = ?",[id])
                const images = await pool.query("SELECT i.image_id,i.image_path FROM images i where post_id = ?",[id])
                data = result[0]
                res.json({
                    data: result[0],
                    images: images[0]
                })
            } catch (error) {
                console.log(error)
                res.json({
                    status: "error"
                })
            }
        },
        getByUid: async (req, res) => {
            try {
                const { id } = req.params
                const result = await pool.query("CALL PostToCard(?);", [id])
                data = result[0]
                res.json(data[0])
            } catch (error) {
                console.log(error)
                res.json({
                    status: "error"
                })
            }
        },
        create: async (req, res) => {
            try {
              const { uid, content } = req.body;
              const images = req.files; // Extract uploaded images from the request
        
              // Insert post data into the posts table
              const [postRows, postFields] = await pool.query(
                'INSERT INTO posts (uid, content, create_at) VALUES (?, ?, NOW())',
                [uid, content]
              );
        
              const postId = postRows.insertId;
        
              // Insert image paths into the images table
              for (const image of images) {
                const ImagePath = path.join('https://trade-d-bucket.s3.ap-southeast-1.amazonaws.com/' ,image.filename)
                await pool.query(
                  'INSERT INTO images (post_id, image_path) VALUES (?, ?)',
                  [postId, ImagePath]
                );
              }
        
              res.json({
                status: 'success',
                message: 'Post created with images',
              });
              console.log(res.json)
            } catch (error) {
              console.log(error);
              res.json({
                status: 'error',
                message: 'Error creating post with images',
              });
            }
          },
        
        update: async (req, res) => {
            try {
                const {content } = req.body
                const { id } = req.params
                const sql = "update posts set content = ? where post_id = ?"
                const [rows, fields] = await pool.query(sql, [content, id])
                res.json({
                    status:'success',
                    message:'Post Updated',
                })
            } catch (error) {
                console.log(error)
                res.json({
                    status: "error"
                })
            }
        }, 
        delete: async (req, res) => {
            try {
                const { id } = req.params
                const [rows, fields] = await pool.query("CALL DeletePost(?);", [id])
                res.json({
                    status:'success',
                    message:'Post Deleted',
                })
            } catch (error) {
                console.log(error)
                res.json({
                    status: "error"
                })
            }
        }
    
    }
}

// module.exports = postsController