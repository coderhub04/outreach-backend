require("dotenv").config();
const express = require("express");
const cors = require("cors");
var bodyParser = require('body-parser')
const { getMessaging } = require("firebase-admin/messaging");

const userRoutes = require("./routes/UserRoutes");
const helpAndSupportRoutes = require("./routes/HelpAndSupportRoutes");
const feedsRoutes = require("./routes/FeedsRoutes");
const adminRoutes = require("./routes/AdminRoutes");
const forumRoutes = require("./routes/ForumRoutes");
const FeedCommentRoutes = require("./routes/FeedCommentRoutes");
const ForumFeedCommentRoutes = require("./routes/ForumFeedCommentRoutes");
const FollowingRoutes = require("./routes/FollowingRoutes");
const ResourceCategoryRoutes = require("./routes/resource/CategoryRoutes");
const ResourceFeedRoutes = require("./routes/resource/FeedsRoutes");
const StoryRoutes = require("./routes/StoryRoutes");
const ReportRoutes = require("./routes/ReportRoutes")
const NotificationRoutes = require("./routes/NotificationRoutes")
const AgoraRoutes = require("./routes/AgoraRoutes")

//ADMIN
const forumRoutesAdmin = require("./routes/admin/ForumRoutes");

const mongoose = require("mongoose");

const app = express();
app.use(cors({ origin: ["*", 'http://localhost:5173'] }));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true, parameterLimit: 100000 }));


app.use("/user", userRoutes);
app.use("/support", helpAndSupportRoutes);
app.use("/feed", feedsRoutes);
app.use("/admin", adminRoutes);
app.use("/forum", forumRoutes);
app.use("/feed-comment", FeedCommentRoutes);
app.use("/forum-feed-comment", ForumFeedCommentRoutes);
app.use("/follow", FollowingRoutes);
app.use("/resource", ResourceFeedRoutes);
app.use("/resource-category", ResourceCategoryRoutes);
app.use("/story", StoryRoutes);
app.use("/report", ReportRoutes)
app.use("/notification", NotificationRoutes)
app.use("/agora", AgoraRoutes)
// ADMIN
app.use("/admin/forum", forumRoutesAdmin)

mongoose.connect(process.env.MONGO_URL)
    .then(() => { console.log("Database is Connected") })
    .catch((err) => { console.log("Database is not Connected ", err) })

app.listen(process.env.PORT, () => console.log(`Server Listening at PORT:${process.env.PORT}`));