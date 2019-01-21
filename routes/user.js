const fs = require('fs');

module.exports = {
    addUserPage: (req, res) => {
        res.render('add-user.ejs', {
            title: "Welcome To Budget Sheet | Add A User"
            ,message: ''
        });
    },
    addUser: (req, res) => {
        if (!req.files) {
            return res.status(400).send("No files were uploaded.");
        }

        let message = '';
        let first_name = req.body.first_name;
        let last_name = req.body.last_name;
        let email_address = req.body.email_address;
        let password = req.body.password;
        let uploadedFile = req.files.image;
        let image_name = uploadedFile.name;
        let fileExtension = uploadedFile.mimetype.split('/')[1];
        image_name = first_name + last_name + '.' + fileExtension;

        let emailQuery = "SELECT * FROM `users` WHERE email_address = '" + email_address + "'";

        db.query(emailQuery, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            if (result.length > 0) {
                message = 'Email address already exists';
                res.render('add-user.ejs', {
                    message,
                    title: "Welcome To Budget Sheet | Add A User"
                });
            } else {
                // check the filetype before uploading it
                if (uploadedFile.mimetype === 'image/png' || uploadedFile.mimetype === 'image/jpeg' || uploadedFile.mimetype === 'image/gif') {
                    // upload the file to the /public/assets/img directory
                    uploadedFile.mv(`public/assets/img/${image_name}`, (err ) => {
                        if (err) {
                            return res.status(500).send(err);
                        }
                        // send the user's details to the database
                        let query = "INSERT INTO `users` (first_name, last_name, email_address, image, password) VALUES ('" +
                            first_name + "', '" + last_name + "', '" + email_address + "', '" + image_name + "', '" + password + "')";
                        db.query(query, (err, result) => {
                            if (err) {
                                return res.status(500).send(err);
                            }
                            res.redirect('/');
                        });
                    });
                } else {
                    message = "Invalid File format. Only 'gif', 'jpeg' and 'png' images are allowed.";
                    res.render('add-user.ejs', {
                        message,
                        title: "Welcome To Budget Sheet | Add A User"
                    });
                }
            }
        });
    },
    editUserPage: (req, res) => {
        let user_id = req.params.id;
        let query = "SELECT * FROM `users` WHERE user_id = '" + user_id + "' ";
        db.query(query, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.render('edit-user.ejs', {
                title: "Edit User"
                ,user: result[0]
                ,message: ''
            });
        });
    },
    editUser: (req, res) => {
        let user_id = req.params.id;
        let first_name = req.body.first_name;
        let last_name = req.body.last_name;
        //let email_address = req.body.email_address;
        //let password = req.body.password;

        let query = "UPDATE `users` SET `first_name` = '" + first_name + "', `last_name` = '" + last_name + "' WHERE `users`.`user_id` = '" + user_id + "'";
        db.query(query, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.redirect('/');
        });
    },
    deleteUserPage: (req, res) => {
        let user_Id = req.params.id;
        let query = "SELECT * FROM `users` WHERE id = '" + user_Id + "' ";
        db.query(query, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.render('delete-user.ejs', {
                title: "Delete User"
                ,user: result[0]
                ,message: ''
            });
        });
    },
    deleteUser: (req, res) => {
        let user_Id = req.params.id;
        let getImageQuery = 'SELECT image from `users` WHERE user_id = "' + user_Id + '"';
        let deleteUserQuery = 'DELETE FROM users WHERE user_id = "' + user_Id + '"';

        db.query(getImageQuery, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }

            let image = result[0].image;

            fs.unlink(`public/assets/img/${image}`, (err) => {
                if (err) {
                    return res.status(500).send(err);
                }
                db.query(deleteUserQuery, (err, result) => {
                    if (err) {
                        return res.status(500).send(err);
                    }
                    res.redirect('/');
                });
            });
        });
    }
};