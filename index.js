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
const userRoutesAdmin = require("./routes/admin/UserRoutes");
const storyRoutesAdmin = require("./routes/admin/StoryRoutes");
const resourceRoutesAdmin = require("./routes/admin/ResourceRoutes");
const postRoutesAdmin = require("./routes/admin/FeedRoutes");
const forumPostsRoutesAdmin = require("./routes/admin/ForumFeedRoutes");

const mongoose = require("mongoose");
const sendResponse = require("./utils/response");
const UserModel = require("./models/UserModel");
const FeedsModel = require("./models/FeedsModel");
const ResourceFeedsModel = require("./models/ResourceFeed");
const ForumModel = require("./models/ForumModel");
const ForumFeedModel = require("./models/ForumFeedModel");
const ReportModel = require("./models/ReportModel");
const verifyAdmin = require("./middlewares/verifyAdmin");

const app = express();
app.use(cors({ origin: ["*", 'http://localhost:5173', "https://outreach-web.vercel.app", "https://outreach-dashboard.vercel.app"] }));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true, parameterLimit: 100000 }));

app.get("/", (req, res) => {
    res.status(200).json({
        error: false,
        message: "Outreach Server Status: Online"
    })
})
app.get("/dashboard/admin", verifyAdmin, async (req, res) => {
    try {

        // USERS
        const totalUsers = await UserModel.countDocuments()
        const activeUsers = await UserModel.countDocuments({ block: false })
        const inactiveUsers = await UserModel.countDocuments({ block: true })

        // POSTS
        const totalPosts = await FeedsModel.countDocuments()
        const disabledPosts = await FeedsModel.countDocuments({ block: true })
        const activePosts = await FeedsModel.countDocuments({ block: false })

        // RESOURCES
        const totalResourcePosts = await ResourceFeedsModel.countDocuments()
        const disabledResourcePosts = await ResourceFeedsModel.countDocuments({ block: true })
        const activeResourcePosts = await ResourceFeedsModel.countDocuments({ block: false })

        // FORUM
        const totalForums = await ForumModel.countDocuments()
        const disabledForums = await ForumModel.countDocuments({ disabled: true })
        const activeForums = await ForumModel.countDocuments({ disabled: false })

        // FORUM-POST
        const totalForumPosts = await ForumFeedModel.countDocuments()
        const disabledForumPosts = await ForumFeedModel.countDocuments({ block: true })
        const activeForumPosts = await ForumFeedModel.countDocuments({ block: false })

        // REPORTS
        // const totalReports = await ReportModel.countDocuments()
        const postReports = await ReportModel.countDocuments({ type: "post" })
        const resourceReports = await ReportModel.countDocuments({ type: "resource" })
        const forumPostReports = await ReportModel.countDocuments({ type: "forum" })

        // GRAPH-USERS - Last 6 Months

        const usersReport = await UserModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
                    }
                }
            },
            {
                $project: {
                    createdAt: {
                        $toDate: "$createdAt"
                    }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: {
                        $let: {
                            vars: {
                                months: [
                                    "January", "February", "March", "April",
                                    "May", "June", "July", "August",
                                    "September", "October", "November", "December"
                                ]
                            },
                            in: {
                                $arrayElemAt: ["$$months", { $subtract: ["$_id.month", 1] }]
                            }
                        }
                    },
                    count: 1,
                    sortOrder: {
                        $concat: [
                            { $toString: "$_id.year" },
                            {
                                $cond: {
                                    if: { $lt: ["$_id.month", 10] },
                                    then: { $concat: ["0", { $toString: "$_id.month" }] },
                                    else: { $toString: "$_id.month" }
                                }
                            }
                        ]
                    }
                }
            },
            {
                $sort: { sortOrder: 1 }
            },
            {
                $group: {
                    _id: null,
                    data: {
                        $push: {
                            k: { $toString: "$month" },
                            v: "$count"
                        }
                    }
                }
            },
            {
                $replaceRoot: {
                    newRoot: { $arrayToObject: "$data" }
                }
            }
        ])
        const postsReport = await FeedsModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
                    }
                }
            },
            {
                $project: {
                    createdAt: {
                        $toDate: "$createdAt"
                    }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: {
                        $let: {
                            vars: {
                                months: [
                                    "January", "February", "March", "April",
                                    "May", "June", "July", "August",
                                    "September", "October", "November", "December"
                                ]
                            },
                            in: {
                                $arrayElemAt: ["$$months", { $subtract: ["$_id.month", 1] }]
                            }
                        }
                    },
                    count: 1,
                    sortOrder: {
                        $concat: [
                            { $toString: "$_id.year" },
                            {
                                $cond: {
                                    if: { $lt: ["$_id.month", 10] },
                                    then: { $concat: ["0", { $toString: "$_id.month" }] },
                                    else: { $toString: "$_id.month" }
                                }
                            }
                        ]
                    }
                }
            },
            {
                $sort: { sortOrder: 1 }
            },
            {
                $group: {
                    _id: null,
                    data: {
                        $push: {
                            k: { $toString: "$month" },
                            v: "$count"
                        }
                    }
                }
            },
            {
                $replaceRoot: {
                    newRoot: { $arrayToObject: "$data" }
                }
            }
        ])

        return sendResponse(200, true, "Dashboard Details fetched successfully", {
            reports: {
                post: postReports,
                resource: resourceReports,
                forum: forumPostReports
            },
            user: {
                total: totalUsers,
                active: activeUsers,
                disabled: inactiveUsers
            },
            post: {
                total: totalPosts,
                active: activePosts,
                disabled: disabledPosts
            },
            forum: {
                total: totalForums,
                active: activeForums,
                disabled: disabledForums
            },
            forumpost: {
                total: totalForumPosts,
                active: activeForumPosts,
                disabled: disabledForumPosts
            },
            resource: {
                total: totalResourcePosts,
                active: activeResourcePosts,
                disabled: disabledResourcePosts
            },
            graph: {
                users: Object.entries(usersReport[0]),
                posts: Object.entries(postsReport[0])
            }
        }, res);
    } catch (error) {
        return sendResponse(500, false, "Internal Server Error", null, res);
    }
})
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
app.use("/admin/user", userRoutesAdmin)
app.use("/admin/story", storyRoutesAdmin)
app.use("/admin/resource", resourceRoutesAdmin)
app.use("/admin/post", postRoutesAdmin)
app.use("/admin/forum-post", forumPostsRoutesAdmin)

mongoose.connect(process.env.MONGO_URL)
    .then(() => { console.log("Database is Connected") })
    .catch((err) => { console.log("Database is not Connected ", err) })

app.listen(process.env.PORT, () => console.log(`Server Listening at PORT:${process.env.PORT}`));