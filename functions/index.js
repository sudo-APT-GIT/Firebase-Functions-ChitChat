"use-strict";

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//     functions.logger.info("Hello logs!", { structuredData: true });
//     response.send("Hello from Firebase!");
// });

exports.sendNotification = functions.database.ref('/Notifications/{user_id}/{notification_id}').onWrite((change, context) => {
    const user_id = context.params.user_id;
    const notification = context.params.notification_id;

    console.log('The User id: ', user_id);

    // if (!context.data.val()) {
    //     return console.log('A new notification has been deleted from the database: ', notification);
    // }

    const fromUser = admin.database().ref(`/Notifications/${user_id}/${notification}`).once('value');

    return fromUser.then(fromUserResult => {

        const from_user_id = fromUserResult.val().from;

        console.log('You have new notification from ', from_user_id);

        const userQuery = admin.database().ref(`/Users/${from_user_id}/name`).once('value');

        return userQuery.then(userResult => {
            const userName = userResult.val();


            const deviceToken = admin.database().ref(`/Users/${user_id}/device_token`).once('value');

            return deviceToken.then((context) => {

                const token_id = context.val();

                const payLoad = {
                    notification: {
                        title: "New Friend Request",
                        body: `${userName} has sent you a request`,
                        icon: "default",
                        click_action: "com.example.chitchat_TARGET_NOTIFICATION"
                    },
                    data: {
                        from_user_id: from_user_id
                    }
                };

                return admin.messaging().sendToDevice(token_id, payLoad).then(response => {
                    return console.log('This was the notification feature');
                });

            });


        });


    });

});