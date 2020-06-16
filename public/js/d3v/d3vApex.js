/*
 @description apex dictionary in json
 @author phil rymek
 
 Copyright (c) 2020, salesforce.com, inc.
 All rights reserved.
 SPDX-License-Identifier: BSD-3-Clause
 For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause 
*/

var apexLang = {
    "ChatterFeeds": {
        "staticMethods": [{
            "type": "void",
            "name": "deleteComment",
            "parameters": ["(String communityId, String commentId)"]
        }, {
            "type": "void",
            "name": "deleteFeedElement",
            "parameters": ["(String communityId, String feedElementId)"]
        }, {
            "type": "void",
            "name": "deleteFeedItem",
            "parameters": ["(String communityId, String feedItemId)"]
        }, {
            "type": "void",
            "name": "deleteLike",
            "parameters": ["(String communityId, String likeId)"]
        }, {
            "type": "ConnectApi.Comment",
            "name": "getComment",
            "parameters": ["(String communityId, String commentId)"]
        }, {
            "type": "ConnectApi.CommentPage",
            "name": "getCommentsForFeedElement",
            "parameters": ["(String communityId, String feedElementId)", "(String communityId, String feedElementId, String pageParam, Integer pageSize)"]
        }, {
            "type": "ConnectApi.CommentPage",
            "name": "getCommentsForFeedItem",
            "parameters": ["(String communityId, String feedItemId)", "(String communityId, String feedItemId, String pageParam, Integer pageSize)"]
        }, {
            "type": "ConnectApi.Feed",
            "name": "getFeed",
            "parameters": ["(String communityId, ConnectApi.FeedType feedType)", "(String communityId, ConnectApi.FeedType feedType, ConnectApi.FeedSortOrder sortParam)", "(String communityId, ConnectApi.FeedType feedType, String subjectId)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, ConnectApi.FeedSortOrder sortParam)"]
        }, {
            "type": "ConnectApi.FeedDirectory",
            "name": "getFeedDirectory",
            "parameters": ["(String communityId)"]
        }, {
            "type": "ConnectApi.FeedElement",
            "name": "getFeedElement",
            "parameters": ["(String communityId, String feedElementId)", "(String communityId, String feedElementId, Integer recentCommentCount, Integer elementsPerBundle)"]
        }, {
            "type": "ConnectApi.BatchResult[]",
            "name": "getFeedElementBatch",
            "parameters": ["(String communityId, List<String> feedElementIds)"]
        }, {
            "type": "ConnectApi.PollCapability",
            "name": "getFeedElementPoll",
            "parameters": ["(String communityId, String feedElementId)"]
        }, {
            "type": "ConnectApi.FeedElementPage",
            "name": "getFeedElementsFromBundle",
            "parameters": ["(String communityId, String feedElementId)", "(String communityId, String feedElementId, String pageParam, Integer pageSize, Integer elementsPerBundle, Integer recentCommentCount)"]
        }, {
            "type": "ConnectApi.FeedElementPage",
            "name": "getFeedElementsFromFeed",
            "parameters": ["(String communityId, ConnectApi.FeedType feedType)", "(String communityId, ConnectApi.FeedType feedType, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam)", "(String communityId, ConnectApi.FeedType feedType, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam)", "(String communityId, ConnectApi.FeedType feedType, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, ConnectApi.FeedFilter filter)", "(String communityId, ConnectApi.FeedType feedType, String subjectId)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, Boolean showInternalOnly)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, Integer recentCommentCount, Integer elementsPerBundle, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, Boolean showInternalOnly)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, Integer recentCommentCount, Integer elementsPerBundle, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, Boolean showInternalOnly, ConnectApi.FeedFilter filter)"]
        }, {
            "type": "ConnectApi.FeedElementPage",
            "name": "getFeedElementsFromFilterFeed",
            "parameters": ["(String communityId, String subjectId, String keyPrefix)", "(String communityId, String subjectId, String keyPrefix, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam)", "(String communityId, String subjectId, String keyPrefix, Integer recentCommentCount, Integer elementsPerBundle, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam)"]
        }, {
            "type": "ConnectApi.FeedElementPage",
            "name": "getFeedElementsFromFilterFeedUpdatedSince",
            "parameters": ["(String communityId, String subjectId, String keyPrefix, Integer recentCommentCount, Integer elementsPerClump, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, String updatedSince)"]
        }, {
            "type": "ConnectApi.FeedElementPage",
            "name": "getFeedElementsUpdatedSince",
            "parameters": ["(String communityId, ConnectApi.FeedType feedType, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, String updatedSince)", "(String communityId, ConnectApi.FeedType feedType, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, String updatedSince, ConnectApi.FeedFilter filter)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, String updatedSince)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, String updatedSince, Boolean showInternalOnly)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, Integer recentCommentCount, Integer elementsPerClump, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, String updatedSince, Boolean showInternalOnly)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, Integer recentCommentCount, Integer elementsPerClump, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, String updatedSince, Boolean showInternalOnly, ConnectApi.FeedFilter filter)"]
        }, {
            "type": "ConnectApi.FeedItem",
            "name": "getFeedItem",
            "parameters": ["(String communityId, String feedItemId)"]
        }, {
            "type": "ConnectApi.BatchResult[]",
            "name": "getFeedItemBatch",
            "parameters": ["(String communityId, List<String> feedItemIds)"]
        }, {
            "type": "ConnectApi.FeedItemPage",
            "name": "getFeedItemsFromFeed",
            "parameters": ["(String communityId, ConnectApi.FeedType feedType)", "(String communityId, ConnectApi.FeedType feedType, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam)", "(String communityId, ConnectApi.FeedType feedType, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam)", "(String communityId, ConnectApi.FeedType feedType, String subjectId)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, Boolean showInternalOnly)"]
        }, {
            "type": "ConnectApi.FeedItemPage",
            "name": "getFeedItemsFromFilterFeed",
            "parameters": ["(String communityId, String subjectId, String keyPrefix)", "(String communityId, String subjectId, String keyPrefix, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam)", "(String communityId, String subjectId, String keyPrefix, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam)"]
        }, {
            "type": "ConnectApi.FeedItemPage",
            "name": "getFeedItemsFromFilterFeedUpdatedSince",
            "parameters": ["(String communityId, String subjectId, String keyPrefix, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, String updatedSince)"]
        }, {
            "type": "ConnectApi.FeedItemPage",
            "name": "getFeedItemsUpdatedSince",
            "parameters": ["(String communityId, ConnectApi.FeedType feedType, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, String updatedSince)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, String updatedSince)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, String updatedSince, Boolean showInternalOnly)"]
        }, {
            "type": "ConnectApi.FeedPoll",
            "name": "getFeedPoll",
            "parameters": ["(String communityId, String feedItemId)"]
        }, {
            "type": "ConnectApi.Feed",
            "name": "getFilterFeed",
            "parameters": ["(String communityId, String subjectId, String keyPrefix)", "(String communityId, String subjectId, String keyPrefix, ConnectApi.FeedType sortParam)"]
        }, {
            "type": "ConnectApi.FeedDirectory",
            "name": "getFilterFeedDirectory",
            "parameters": ["(String communityId, String subjectId)"]
        }, {
            "type": "ConnectApi.ChatterLike",
            "name": "getLike",
            "parameters": ["(String communityId, String likeId)"]
        }, {
            "type": "ConnectApi.ChatterLikePage",
            "name": "getLikesForComment",
            "parameters": ["(String communityId, String commentId)", "(String communityId, String commentId, Integer pageParam, Integer pageSize)"]
        }, {
            "type": "ConnectApi.ChatterLikePage",
            "name": "getLikesForFeedElement",
            "parameters": ["(String communityId, String feedElementId)", "(String communityId, String feedElementId, Integer pageParam, Integer pageSize)"]
        }, {
            "type": "ConnectApi.ChatterLikePage",
            "name": "getLikesForFeedItem",
            "parameters": ["(String communityId, String feedItemId)", "(String communityId, String feedItemId, Integer pageParam, Integer pageSize)"]
        }, {
            "type": "ConnectApi.FeedModifiedInfo",
            "name": "isModified",
            "parameters": ["(String communityId, ConnectApi.FeedType feedType, String subjectId, String since)"]
        }, {
            "type": "ConnectApi.ChatterLike",
            "name": "likeComment",
            "parameters": ["(String communityId, String commentId)"]
        }, {
            "type": "ConnectApi.ChatterLike",
            "name": "likeFeedElement",
            "parameters": ["(String communityId, String feedElementId)"]
        }, {
            "type": "ConnectApi.ChatterLike",
            "name": "likeFeedItem",
            "parameters": ["(String communityId, String feedItemId)"]
        }, {
            "type": "ConnectApi.Comment",
            "name": "postComment",
            "parameters": ["(String communityId, String feedItemId, String text)", "(String communityId, String feedItemId, ConnectApi.CommentInput comment, ConnectApi.BinaryInput feedItemFileUpload)"]
        }, {
            "type": "ConnectApi.Comment",
            "name": "postCommentToFeedElement",
            "parameters": ["(String communityId, String feedElementId, String text)", "(String communityId, String feedElementId, ConnectApi.CommentInput comment, ConnectApi.BinaryInput feedElementFileUpload)"]
        }, {
            "type": "ConnectApi.FeedElement",
            "name": "postFeedElement",
            "parameters": ["(String communityId, String subjectId, ConnectApi.FeedElementType feedElementType, String text)", "(String communityId, ConnectApi.FeedElementInput feedElement, ConnectApi.BinaryInput feedElementFileUpload)"]
        }, {
            "type": "ConnectApi.BatchResult[]",
            "name": "postFeedElementBatch",
            "parameters": ["(String communityId, List<ConnectApi.BatchInput> feedElements)"]
        }, {
            "type": "ConnectApi.FeedItem",
            "name": "postFeedItem",
            "parameters": ["(String communityId, ConnectApi.FeedType feedType, String subjectId, String text)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, ConnectApi.FeedItemInput feedItemInput, ConnectApi.BinaryInput feedItemFileUpload)"]
        }, {
            "type": "ConnectApi.FeedElementPage",
            "name": "searchFeedElements",
            "parameters": ["(String communityId, String q)", "(String communityId, String q, ConnectApi.FeedSortOrder sortParam)", "(String communityId, String q, String pageParam, Integer pageSize)", "(String communityId, String q, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam)", "(String communityId, String q, Integer recentCommentCount, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam)"]
        }, {
            "type": "ConnectApi.FeedElementPage",
            "name": "searchFeedElementsInFeed",
            "parameters": ["(String communityId, ConnectApi.FeedType feedType, String q)", "(String communityId, ConnectApi.FeedType feedType, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, String q)", "(String communityId, ConnectApi.FeedType feedType, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, String q)", "(String communityId, ConnectApi.FeedType feedType, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, String q, ConnectApi.FeedFilter filter)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, String q)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, String q)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, String q)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, String q, Boolean showInternalOnly)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, String q, Boolean showInternalOnly, ConnectApi.FeedFilter filter)"]
        }, {
            "type": "ConnectApi.FeedElementPage",
            "name": "searchFeedElementsInFilterFeed",
            "parameters": ["(String communityId, String subjectId, String keyPrefix, String q)", "(String communityId, String subjectId, String keyPrefix, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, String q)", "(String communityId, String subjectId, String keyPrefix, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, String q)"]
        }, {
            "type": "ConnectApi.FeedItemPage",
            "name": "searchFeedItems",
            "parameters": ["(String communityId, String q)", "(String communityId, String q, ConnectApi.FeedSortOrder sortParam)", "(String communityId, String q, String pageParam, Integer pageSize)", "(String communityId, String q, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam)", "(String communityId, String q, Integer recentCommentCount, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam)", "(String communityId, String q, ConnectApi.FeedItemPage result)"]
        }, {
            "type": "ConnectApi.FeedItemPage",
            "name": "searchFeedItemsInFeed",
            "parameters": ["(String communityId, ConnectApi.FeedType feedType, String q)", "(String communityId, ConnectApi.FeedType feedType, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, String q)", "(String communityId, ConnectApi.FeedType feedType, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, String q)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, String q)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, String q)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, String q)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, String q, Boolean showInternalOnly)"]
        }, {
            "type": "ConnectApi.FeedItemPage",
            "name": "searchFeedItemsInFilterFeed",
            "parameters": ["(String communityId, String subjectId, String keyPrefix, String q)", "(String communityId, String subjectId, String keyPrefix, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, String q)", "(String communityId, String subjectId, String keyPrefix, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, String q)"]
        }, {
            "type": "ConnectApi.FeedElement",
            "name": "shareFeedElement",
            "parameters": ["(String communityId, String subjectId, ConnectApi.FeedElementType feedElementType, String originalFeedElementId)"]
        }, {
            "type": "ConnectApi.FeedItem",
            "name": "shareFeedItem",
            "parameters": ["(String communityId, ConnectApi.FeedType feedType, String subjectId, String originalFeedItemId)"]
        }, {
            "type": "ConnectApi.FeedItem",
            "name": "updateBookmark",
            "parameters": ["(String communityId, String feedItemId, Boolean isBookmarkedByCurrentUser)"]
        }, {
            "type": "ConnectApi.BookmarksCapability",
            "name": "updateFeedElementBookmarks",
            "parameters": ["(String communityId, String feedElementId, ConnectApi.BookmarksCapabilityInput bookmarks)", "(String communityId, String feedElementId, Boolean isBookmarkedByCurrentUser)"]
        }, {
            "type": "ConnectApi.PollCapability",
            "name": "voteOnFeedElementPoll",
            "parameters": ["(String communityId, String feedElementId, String myChoiceId)"]
        }, {
            "type": "ConnectApi.FeedPoll",
            "name": "voteOnFeedPoll",
            "parameters": ["(String communityId, String feedItemId, String myChoiceId)"]
        }, {
            "type": "void",
            "name": "setTestGetFeedElementsFromFeed",
            "parameters": ["(String communityId, ConnectApi.FeedType feedType, ConnectApi.FeedElementPage result)", "(String communityId, ConnectApi.FeedType feedType, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, ConnectApi.FeedElementPage result)", "(String communityId, ConnectApi.FeedType feedType, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, ConnectApi.FeedElementPage result)", "(String communityId, ConnectApi.FeedType feedType, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, ConnectApi.FeedFilter filter, ConnectApi.FeedElementPage result)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, ConnectApi.FeedElementPage result)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, ConnectApi.FeedElementPage result)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, ConnectApi.FeedElementPage result)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, Boolean showInternalOnly, ConnectApi.FeedElementPage result)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, Integer recentCommentCount, Integer elementsPerClump, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, Boolean showInternalOnly, ConnectApi.FeedElementPage result)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, Integer recentCommentCount, Integer elementsPerClump, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, Boolean showInternalOnly, ConnectApi.FeedFilter filter, ConnectApi.FeedElementPage result)"]
        }, {
            "type": "void",
            "name": "setTestGetFeedElementsFromFilterFeed",
            "parameters": ["(String communityId, String subjectId, String keyPrefix, ConnectApi.FeedElementPage result)", "(String communityId, String subjectId, String keyPrefix, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, ConnectApi.FeedElementPage result)", "(String communityId, String subjectId, String keyPrefix, Integer recentCommentCount, Integer elementsPerClump, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, ConnectApi.FeedElementPage result)"]
        }, {
            "type": "void",
            "name": "setTestGetFeedElementsFromFilterFeedUpdatedSince",
            "parameters": ["(String communityId, String subjectId, String keyPrefix, Integer recentCommentCount, Integer elementsPerClump, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, String updatedSince, ConnectApi.FeedElementPage result)"]
        }, {
            "type": "void",
            "name": "setTestGetFeedElementsUpdatedSince",
            "parameters": ["(String communityId, ConnectApi.FeedType feedType, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, String updatedSince, ConnectApi.FeedElementPage result)", "(String communityId, ConnectApi.FeedType feedType, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, String updatedSince, ConnectApi.FeedFilter filter, ConnectApi.FeedElementPage result)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, String updatedSince, ConnectApi.FeedElementPage result)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, String updatedSince, Boolean showInternalOnly, ConnectApi.FeedElementPage result)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, Integer recentCommentCount, Integer elementsPerClump, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, String updatedSince, Boolean showInternalOnly, ConnectApi.FeedElementPage result)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, Integer recentCommentCount, Integer elementsPerClump, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, String updatedSince, Boolean showInternalOnly, ConnectApi.FeedFilter filter, ConnectApi.FeedElementPage result)"]
        }, {
            "type": "void",
            "name": "setTestGetFeedItemsFromFeed",
            "parameters": ["(String communityId, ConnectApi.FeedType feedType, ConnectApi.FeedItemPage result)", "(String communityId, ConnectApi.FeedType feedType, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, ConnectApi.FeedItemPage result)", "(String communityId, ConnectApi.FeedType feedType, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, ConnectApi.FeedItemPage result)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, ConnectApi.FeedItemPage result)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, ConnectApi.FeedItemPage result)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, ConnectApi.FeedItemPage result)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, Boolean, showInternalOnly, ConnectApi.FeedItemPage result)"]
        }, {
            "type": "void",
            "name": "setTestGetFeedItemsFromFilterFeed",
            "parameters": ["(String communityId, String subjectId, String keyPrefix, ConnectApi.FeedItemPage result)", "(String communityId, String subjectId, String keyPrefix, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, ConnectApi.FeedItemPage result)", "(String communityId, String subjectId, String keyPrefix, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, ConnectApi.FeedItemPage result)"]
        }, {
            "type": "void",
            "name": "setTestGetFeedItemsFromFilterFeedUpdatedSince",
            "parameters": ["(String communityId, String subjectId, String keyPrefix, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, String updatedSince, ConnectApi.FeedItemPage result)"]
        }, {
            "type": "void",
            "name": "setTestGetFeedItemsUpdatedSince",
            "parameters": ["(String communityId, ConnectApi.FeedType feedType, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, String updatedSince)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, String updatedSince, ConnectApi.FeedItemPage result)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, String updatedSince, Boolean, showInternalOnly, ConnectApi.FeedItemPage result)"]
        }, {
            "type": "void",
            "name": "setTestSearchFeedElements",
            "parameters": ["(String communityId, String q, ConnectApi.FeedElementPage result)", "(String communityId, String q, ConnectApi.FeedSortOrder sortParam, ConnectApi.FeedElementPage result)", "(String communityId, String q, String pageParam, Integer pageSize, ConnectApi.FeedElementPage result)", "(String communityId, String q, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, ConnectApi.FeedElementPage result)", "(String communityId, String q, Integer recentCommentCount, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, ConnectApi.FeedElementPage result)"]
        }, {
            "type": "void",
            "name": "setTestSearchFeedElementsInFeed",
            "parameters": ["(String communityId, ConnectApi.FeedType feedType, String q, ConnectApi.FeedElementPage result)", "(String communityId, ConnectApi.FeedType feedType, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, String q, ConnectApi.FeedElementPage result)", "(String communityId, ConnectApi.FeedType feedType, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, String q, ConnectApi.FeedElementPage result)", "(String communityId, ConnectApi.FeedType feedType, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, String q, ConnectApi.FeedFilter filter, ConnectApi.FeedElementPage result)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, String q, ConnectApi.FeedElementPage result)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, String q, ConnectApi.FeedElementPage result)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, String q, ConnectApi.FeedElementPage result)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, String q, Boolean showInternalOnly, ConnectApi.FeedElementPage result)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, String q, Boolean showInternalOnly, ConnectApi.FeedFilter filter, ConnectApi.FeedElementPage result)"]
        }, {
            "type": "void",
            "name": "setTestSearchFeedElementsInFilterFeed",
            "parameters": ["(String communityId, String subjectId, String keyPrefix, String q, ConnectApi.FeedElementPage result)", "(String communityId, String subjectId, String keyPrefix, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, String q, ConnectApi.FeedElementPage result)", "(String communityId, String subjectId, String keyPrefix, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, String q, ConnectApi.FeedElementPage result)"]
        }, {
            "type": "void",
            "name": "setTestSearchFeedItems",
            "parameters": ["(String communityId, String q, ConnectApi.FeedSortOrder sortParam, ConnectApi.FeedItemPage result)", "(String communityId, String q, String pageParam, Integer pageSize, ConnectApi.FeedItemPage result)", "(String communityId, String q, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, ConnectApi.FeedItemPage result)", "(String communityId, String q, Integer recentCommentCount, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, ConnectApi.FeedItemPage result)"]
        }, {
            "type": "void",
            "name": "setTestSearchFeedItemsInFeed",
            "parameters": ["(String communityId, ConnectApi.FeedType feedType, String q, ConnectApi.FeedItemPage result)", "(String communityId, ConnectApi.FeedType feedType, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, String q, ConnectApi.FeedItemPage result)", "(String communityId, ConnectApi.FeedType feedType, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, String q, ConnectApi.FeedItemPage result)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, String q, ConnectApi.FeedItemPage result)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, String q, ConnectApi.FeedItemPage result)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, String q, ConnectApi.FeedItemPage result)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, String q, Boolean showInternalOnly, ConnectApi.FeedItemPage result)"]
        }, {
            "type": "void",
            "name": "setTestSearchFeedItemsInFilterFeed",
            "parameters": ["(String communityId, String subjectId, String keyPrefix, String q, ConnectApi.FeedItemPage result)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, String keyPrefix, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, String q, ConnectApi.FeedItemPage result)", "(String communityId, ConnectApi.FeedType feedType, String subjectId, String keyPrefix, Integer recentCommentCount, ConnectApi.FeedDensity density, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, String q, ConnectApi.FeedItemPage result)"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "Type": {
        "staticMethods": [{
            "type": "System.Type",
            "name": "forName",
            "parameters": ["(String fullyQualifiedName)", "(String namespace, String name)"]
        }],
        "instanceMethods": [{
            "type": "Boolean",
            "name": "equals",
            "parameters": ["(Object toCompare)"]
        }, {
            "type": "String",
            "name": "getName",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "hashCode",
            "parameters": ["()"]
        }, {
            "type": "Object",
            "name": "newInstance",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "toString",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "System": {
        "staticMethods": [{
            "type": "void",
            "name": "abortJob",
            "parameters": ["(String Job_ID)"]
        }, {
            "type": "void",
            "name": "assert",
            "parameters": ["(Boolean condition, Object opt_msg)"]
        }, {
            "type": "void",
            "name": "assertEquals",
            "parameters": ["(Object expected, Object actual)", "(Object expected, Object actual, Object opt_msg)"]
        }, {
            "type": "void",
            "name": "assertNotEquals",
            "parameters": ["(Object expected, Object actual)", "(Object expected, Object actual, Object opt_msg)"]
        }, {
            "type": "PageReference",
            "name": "currentPageReference",
            "parameters": ["()"]
        }, {
            "type": "Long",
            "name": "currentTimeMillis",
            "parameters": ["()"]
        }, {
            "type": "void",
            "name": "debug",
            "parameters": ["(Object msg)", "(LoggingLevel logLevel, Object msg)"]
        }, {
            "type": "ID",
            "name": "enqueueJob",
            "parameters": ["(Object queueableObj)"]
        }, {
            "type": "Boolean",
            "name": "equals",
            "parameters": ["(Object obj1, Object obj2)"]
        }, {
            "type": "System.ApplicationReadWriteMode",
            "name": "getApplicationReadWriteMode",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "hashCode",
            "parameters": ["(Object obj)"]
        }, {
            "type": "Boolean",
            "name": "isBatch",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isFuture",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isScheduled",
            "parameters": ["()"]
        }, {
            "type": "Datetime",
            "name": "now",
            "parameters": ["()"]
        }, {
            "type": "List<Id>",
            "name": "process",
            "parameters": ["(List<Id> WorkItemIDs, String Action, String Comments, String NextApprover)"]
        }, {
            "type": "Integer",
            "name": "purgeOldAsyncJobs",
            "parameters": ["(Date dt)"]
        }, {
            "type": "System.Version",
            "name": "requestVersion",
            "parameters": ["()"]
        }, {
            "type": "System.ResetPasswordResult",
            "name": "resetPassword",
            "parameters": ["(ID userID, Boolean send_user_email)"]
        }, {
            "type": "void",
            "name": "runAs",
            "parameters": ["(System.Version version)", "(User user_var)"]
        }, {
            "type": "String",
            "name": "schedule",
            "parameters": ["(String JobName, String CronExpression, Object schedulable_class)"]
        }, {
            "type": "String",
            "name": "scheduleBatch",
            "parameters": ["(Database.Batchable batchable, String jobName, Integer minutesFromNow)", "(Database.Batchable batchable, String jobName, Integer minutesFromNow, Integer scopeSize)"]
        }, {
            "type": "void",
            "name": "setPassword",
            "parameters": ["(ID userID, String password)"]
        }, {
            "type": "List<ID>",
            "name": "submit",
            "parameters": ["(List<ID> workItemIDs, String Comments, String NextApprover)"]
        }, {
            "type": "Date",
            "name": "today",
            "parameters": ["()"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "ChatterMessages": {
        "staticMethods": [{
            "type": "ConnectApi.ChatterConversation",
            "name": "getConversation",
            "parameters": ["(String conversationId)", "(String conversationId, String pageParam, Integer pageSize)", "(String communityId, String conversationId)", "(String communityId, String conversationId, String pageParam, String pageSize)"]
        }, {
            "type": "ConnectApi.ChatterConversationPage",
            "name": "getConversations",
            "parameters": ["()", "(String pageParam, Integer pageSize)", "(String communityId)", "(String communityId, String pageParam, Integer pageSize)"]
        }, {
            "type": "ConnectApi.ChatterMessage",
            "name": "getMessage",
            "parameters": ["(String messageId)", "(String communityId, String messageId)"]
        }, {
            "type": "ConnectApi.ChatterMessagePage",
            "name": "getMessages",
            "parameters": ["()", "(String pageParam, Integer pageSize)", "(String communityId)", "(String communityId, String pageParam, Integer pageSize)"]
        }, {
            "type": "ConnectApi.UnreadConversationCount",
            "name": "getUnreadCount",
            "parameters": ["()", "(String communityId)"]
        }, {
            "type": "ConnectApi.ChatterConversationSummary",
            "name": "markConversationRead",
            "parameters": ["(String conversationId, Boolean read)", "(String communityId, String conversationID, Boolean read)"]
        }, {
            "type": "ConnectApi.ChatterMessage",
            "name": "replyToMessage",
            "parameters": ["(String text, String inReplyTo)", "(String communityId, String text, String inReplyTo)"]
        }, {
            "type": "ConnectApi.ChatterConversation",
            "name": "searchConversation",
            "parameters": ["(String conversationId, String q)", "(String conversationId, String pageParam, Integer pageSize, String q)", "(String communityId, String conversationId, String q)", "(String communityId, String conversationId, String pageParam, Integer pageSize, String q)"]
        }, {
            "type": "ConnectApi.ChatterConversationPage",
            "name": "searchConversations",
            "parameters": ["(String q)", "(String pageParam, Integer pageSize, String q)", "(String communityId, String q)", "(String communityId, String pageParam, Integer pageSize, String q)"]
        }, {
            "type": "ConnectApi.ChatterMessagePage",
            "name": "searchMessages",
            "parameters": ["(String q)", "(String pageParam, Integer pageSize, String q)", "(String communityId, String q)", "(String communityId, String pageParam, Integer pageSize, String q)"]
        }, {
            "type": "ConnectApi.ChatterMessage",
            "name": "sendMessage",
            "parameters": ["(String text, String recipients)", "(String communityId, String text, String recipients)"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "KnowledgeArticleVersionStandardController": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String",
            "name": "getSourceId",
            "parameters": ["()"]
        }, {
            "type": "void",
            "name": "setDataCategory",
            "parameters": ["(String categoryGroup, String category)"]
        }],
        "properties": [],
        "constructors": [{
            "type": "void",
            "name": "KnowledgeArticleVersionStandardController",
            "parameters": ["(SObject article)"]
        }]
    },
    "Database": {
        "staticMethods": [{
            "type": "Database.LeadConvertResult",
            "name": "convertLead",
            "parameters": ["(Database.LeadConvert leadToConvert, Boolean opt_allOrNone)", "(Database.LeadConvert[] leadsToConvert, Boolean opt_allOrNone)"]
        }, {
            "type": "Integer",
            "name": "countQuery",
            "parameters": ["(String query)"]
        }, {
            "type": "Database.DeleteResult",
            "name": "delete",
            "parameters": ["(SObject recordToDelete, Boolean opt_allOrNone)", "(SObject[] recordsToDelete, Boolean opt_allOrNone)", "(ID recordID, Boolean opt_allOrNone)", "(ID[] recordIDs, Boolean opt_allOrNone)"]
        }, {
            "type": "Database.EmptyRecycleBinResult[]",
            "name": "emptyRecycleBin",
            "parameters": ["(ID [] recordIds)", "(sObject obj)", "(sObject[] listOfSObjects)"]
        }, {
            "type": "ID",
            "name": "executeBatch",
            "parameters": ["(Object batchClassObject)", "(Object batchClassObject, Integer scope)"]
        }, {
            "type": "Database.GetDeletedResult",
            "name": "getDeleted",
            "parameters": ["(String sObjectType, Datetime startDate, Datetime endDate)"]
        }, {
            "type": "Database.QueryLocator",
            "name": "getQueryLocator",
            "parameters": ["(sObject [] listOfQueries)"]
        }, {
            "type": "Database.QueryLocator",
            "name": "getQueryLocator",
            "parameters": ["(String query)"]
        }, {
            "type": "Database.GetUpdatedResult",
            "name": "getUpdated",
            "parameters": ["(String sobjectType, Datetime startDate, Datetime endDate)"]
        }, {
            "type": "Database.SaveResult",
            "name": "insert",
            "parameters": ["(sObject recordToInsert, Boolean opt_allOrNone)", "(sObject [] recordsToInsert, Boolean opt_allOrNone)", "(sObject recordToInsert, Database.DMLOptions options)", "(sObject[] recordToInsert, Database.DMLOptions options)"]
        }, {
            "type": "Database.MergeResult",
            "name": "merge",
            "parameters": ["(sObject master, Id duplicate)", "(sObject master, sObject duplicate)", "(sObject master, List<Id> duplicates)", "(sObject master, List<SObject> duplicates)", "(sObject master, Id duplicate, Boolean allOrNothing)", "(sObject master, sObject duplicate, Boolean allOrNone)", "(sObject master, List<Id> duplicates, Boolean allOrNone)", "(sObject master, List<SObject> duplicates, Boolean allOrNone)"]
        }, {
            "type": "sObject[]",
            "name": "query",
            "parameters": ["(String query)"]
        }, {
            "type": "void",
            "name": "rollback",
            "parameters": ["(System.Savepoint sp)"]
        }, {
            "type": "System.Savepoint",
            "name": "setSavepoint",
            "parameters": ["()"]
        }, {
            "type": "Database.UndeleteResult",
            "name": "undelete",
            "parameters": ["(sObject recordToUndelete, Boolean opt_allOrNone)", "(sObject [] recordsToUndelete, Boolean opt_allOrNone)", "(ID recordID, Boolean opt_allOrNone)", "(ID[] recordIDs, Boolean opt_allOrNone)"]
        }, {
            "type": "Database.SaveResult",
            "name": "update",
            "parameters": ["(sObject recordToUpdate, Boolean opt_allOrNone)", "(sObject[] recordsToUpdate, Boolean opt_allOrNone)", "(sObject recordToUpdate, Database.DmlOptions options)", "(sObject[] recordsToUpdate, Database.DMLOptions options)"]
        }, {
            "type": "Database.UpsertResult",
            "name": "upsert",
            "parameters": ["(sObject recordToUpsert, Schema.SObjectField external_ID_Field, Boolean opt_allOrNone)", "(sObject [] recordsToUpsert, Schema.SObjectField External_ID_Field, Boolean opt_allOrNone)"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "Cookie": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String",
            "name": "getDomain",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getMaxAge",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getName",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getPath",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getValue",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isSecure",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": [{
            "type": "void",
            "name": "Cookie",
            "parameters": ["(String, String, String, Integer, Boolean)"]
        }]
    },
    "StandardSetController": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "PageReference",
            "name": "cancel",
            "parameters": ["()"]
        }, {
            "type": "void",
            "name": "first",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "getCompleteResult",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getFilterId",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "getHasNext",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "getHasPrevious",
            "parameters": ["()"]
        }, {
            "type": "System.SelectOption",
            "name": "getListViewOptions",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getPageNumber",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getPageSize",
            "parameters": ["()"]
        }, {
            "type": "sObject",
            "name": "getRecord",
            "parameters": ["()"]
        }, {
            "type": "sObject[]",
            "name": "getRecords",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getResultSize",
            "parameters": ["()"]
        }, {
            "type": "sObject[]",
            "name": "getSelected",
            "parameters": ["()"]
        }, {
            "type": "void",
            "name": "last",
            "parameters": ["()"]
        }, {
            "type": "void",
            "name": "next",
            "parameters": ["()"]
        }, {
            "type": "void",
            "name": "previous",
            "parameters": ["()"]
        }, {
            "type": "PageReference",
            "name": "save",
            "parameters": ["()"]
        }, {
            "type": "void",
            "name": "setFilterID",
            "parameters": ["(String filterId)"]
        }, {
            "type": "void",
            "name": "setpageNumber",
            "parameters": ["(Integer pageNumber)"]
        }, {
            "type": "void",
            "name": "setPageSize",
            "parameters": ["(Integer pageSize)"]
        }, {
            "type": "void",
            "name": "setSelected",
            "parameters": ["(sObject[] selectedRecords)"]
        }],
        "properties": [],
        "constructors": [{
            "type": "void",
            "name": "StandardSetController",
            "parameters": ["(Database.QueryLocator SObjectList)", "(List<SObject> controllerSObjects)"]
        }]
    },
    "PluginDescribeResult": {
        "staticMethods": [],
        "instanceMethods": [],
        "properties": [{
            "type": "String",
            "name": "Description"
        }, {
            "type": "List<Process.PluginDescribeResult.InputParameter>",
            "name": "InputParameters"
        }, {
            "type": "String",
            "name": "Name"
        }, {
            "type": "List<Process.PluginDescribeResult.OutputParameter>",
            "name": "OutputParameters"
        }, {
            "type": "String",
            "name": "Tag"
        }],
        "constructors": [{
            "type": "void",
            "name": "PluginDescribeResult",
            "parameters": ["()"]
        }]
    },
    "Message": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String",
            "name": "getComponentLabel",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getDetail",
            "parameters": ["()"]
        }, {
            "type": "ApexPages.Severity",
            "name": "getSeverity",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getSummary",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": [{
            "type": "void",
            "name": "Message",
            "parameters": ["(ApexPages.Severity severity, String summary)", "(ApexPages.Severity severity, String summary, String detail)", "(ApexPages.Severity severity, String summary, String detail, String id)"]
        }]
    },
    "URL": {
        "staticMethods": [{
            "type": "System.URL",
            "name": "getCurrentRequestUrl",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getFileFieldURL",
            "parameters": ["(String entityId, String fieldName)"]
        }, {
            "type": "System.URL",
            "name": "getSalesforceBaseUrl",
            "parameters": ["()"]
        }],
        "instanceMethods": [{
            "type": "void",
            "name": "Url",
            "parameters": ["(String spec)", "(Url context, String spec)", "(String protocol, String host, String file)", "(String protocol, String host, Integer port, String file)"]
        }, {
            "type": "String",
            "name": "getAuthority",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getDefaultPort",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getFile",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getHost",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getPath",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getPort",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getProtocol",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getQuery",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getRef",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getUserInfo",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "sameFile",
            "parameters": ["(System.URL URLToCompare)"]
        }, {
            "type": "String",
            "name": "toExternalForm",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "XmlStreamWriter": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "void",
            "name": "close",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getXmlString",
            "parameters": ["()"]
        }, {
            "type": "void",
            "name": "setDefaultNamespace",
            "parameters": ["(String URI)"]
        }, {
            "type": "void",
            "name": "writeAttribute",
            "parameters": ["(String prefix, String namespaceURI, String localName, String value)"]
        }, {
            "type": "void",
            "name": "writeCData",
            "parameters": ["(String data)"]
        }, {
            "type": "void",
            "name": "writeCharacters",
            "parameters": ["(String text)"]
        }, {
            "type": "void",
            "name": "writeComment",
            "parameters": ["(String data)"]
        }, {
            "type": "void",
            "name": "writeDefaultNamespace",
            "parameters": ["(String namespaceURI)"]
        }, {
            "type": "void",
            "name": "writeEmptyElement",
            "parameters": ["(String prefix, String localName, String namespaceURI)"]
        }, {
            "type": "void",
            "name": "writeEndDocument",
            "parameters": ["()"]
        }, {
            "type": "void",
            "name": "writeEndElement",
            "parameters": ["()"]
        }, {
            "type": "void",
            "name": "writeNamespace",
            "parameters": ["(String prefix, String namespaceURI)"]
        }, {
            "type": "void",
            "name": "writeProcessingInstruction",
            "parameters": ["(String target, String data)"]
        }, {
            "type": "void",
            "name": "writeStartDocument",
            "parameters": ["(String encoding, String version)"]
        }, {
            "type": "void",
            "name": "writeStartElement",
            "parameters": ["(String prefix, String localName, String namespaceURI)"]
        }],
        "properties": [],
        "constructors": [{
            "type": "void",
            "name": "XmlStreamWriter",
            "parameters": ["()"]
        }]
    },
    "WebServiceCallout": {
        "staticMethods": [{
            "type": "void",
            "name": "invoke",
            "parameters": ["(Object stub, Object request, Map<String, Object> response, List<String> info)"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "ChatterFavorites": {
        "staticMethods": [{
            "type": "ConnectApi.FeedFavorite",
            "name": "addFavorite",
            "parameters": ["(String communityId, String subjectId, String searchText)"]
        }, {
            "type": "ConnectApi.FeedFavorite",
            "name": "addRecordFavorite",
            "parameters": ["(String communityId, String subjectId, String targetId)"]
        }, {
            "type": "void",
            "name": "deleteFavorite",
            "parameters": ["(String communityId, String subjectId, String favoriteId)"]
        }, {
            "type": "ConnectApi.FeedFavorite",
            "name": "getFavorite",
            "parameters": ["(String communityId, String subjectId, String favoriteId)"]
        }, {
            "type": "ConnectApi.FeedFavorites",
            "name": "getFavorites",
            "parameters": ["(String communityId, String subjectId)"]
        }, {
            "type": "ConnectApi.FeedElementPage",
            "name": "getFeedElements",
            "parameters": ["(String communityId, String subjectId, String favoriteId)", "(String communityId, String subjectId, String favoriteId, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam)", "(String communityId, String subjectId, String favoriteId, Integer recentCommentCount, Integer elementsPerBundle, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam)"]
        }, {
            "type": "ConnectApi.FeedItemPage",
            "name": "getFeedItems",
            "parameters": ["(String communityId, String subjectId, String favoriteId)", "(String communityId, String subjectId, String favoriteId, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam)", "(String communityId, String subjectId, String favoriteId, Integer recentCommentCount, String pageParam, Integer pageSize, FeedSortOrder sortParam)"]
        }, {
            "type": "ConnectApi.FeedFavorite",
            "name": "updateFavorite",
            "parameters": ["(String communityId, String subjectId, String favoriteId, Boolean updateLastViewDate)"]
        }, {
            "type": "void",
            "name": "setTestGetFeedElements",
            "parameters": ["(String communityId, String subjectId, String favoriteId, ConnectApi.FeedElementPage result)", "(String communityId, String subjectId, String favoriteId, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, ConnectApi.FeedElementPage result)", "(String communityId, String subjectId, String favoriteId, Integer recentCommentCount, Integer elementsPerClump, String pageParam, Integer pageSize, ConnectApi.FeedSortOrder sortParam, ConnectApi.FeedElementPage result)"]
        }, {
            "type": "void",
            "name": "setTestGetFeedItems",
            "parameters": ["(String communityId, String subjectId, String favoriteId, ConnectApi.FeedItemPage result)", "(String communityId, String subjectId, String favoriteId, String pageParam, Integer pageSize, FeedSortOrder sortParam, ConnectApi.FeedItemPage result)", "(String communityId, String subjectId, String favoriteId, Integer recentCommentCount, String pageParam, Integer pageSize, FeedSortOrder sortParam, ConnectApi.FeedItemPage result)"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "JSONParser": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "void",
            "name": "clearCurrentToken",
            "parameters": ["()"]
        }, {
            "type": "Blob",
            "name": "getBlobValue",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "getBooleanValue",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getCurrentName",
            "parameters": ["()"]
        }, {
            "type": "System.JSONToken",
            "name": "getCurrentToken",
            "parameters": ["()"]
        }, {
            "type": "Datetime",
            "name": "getDatetimeValue",
            "parameters": ["()"]
        }, {
            "type": "Date",
            "name": "getDateValue",
            "parameters": ["()"]
        }, {
            "type": "Decimal",
            "name": "getDecimalValue",
            "parameters": ["()"]
        }, {
            "type": "Double",
            "name": "getDoubleValue",
            "parameters": ["()"]
        }, {
            "type": "ID",
            "name": "getIdValue",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getIntegerValue",
            "parameters": ["()"]
        }, {
            "type": "System.JSONToken",
            "name": "getLastClearedToken",
            "parameters": ["()"]
        }, {
            "type": "Long",
            "name": "getLongValue",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getText",
            "parameters": ["()"]
        }, {
            "type": "Time",
            "name": "getTimeValue",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "hasCurrentToken",
            "parameters": ["()"]
        }, {
            "type": "System.JSONToken",
            "name": "nextToken",
            "parameters": ["()"]
        }, {
            "type": "System.JSONToken",
            "name": "nextValue",
            "parameters": ["()"]
        }, {
            "type": "Object",
            "name": "readValueAs",
            "parameters": ["(System.Type apexType)"]
        }, {
            "type": "Object",
            "name": "readValueAsStrict",
            "parameters": ["(System.Type apexType)"]
        }, {
            "type": "void",
            "name": "skipChildren",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "Version": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "Integer",
            "name": "compareTo",
            "parameters": ["(System.Version version)"]
        }, {
            "type": "Integer",
            "name": "major",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "minor",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "patch",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": [{
            "type": "void",
            "name": "Version",
            "parameters": ["(Integer major, Integer minor)", "(Integer major, Integer minor, Integer patch)"]
        }]
    },
    "RestRequest": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "void",
            "name": "addHeader",
            "parameters": ["(String name, String value)"]
        }, {
            "type": "void",
            "name": "addParameter",
            "parameters": ["(String name, String value)"]
        }],
        "properties": [{
            "type": "Map<String, String>",
            "name": "headers"
        }, {
            "type": "String",
            "name": "httpMethod"
        }, {
            "type": "Map<String, String>",
            "name": "params"
        }, {
            "type": "String",
            "name": "remoteAddress"
        }, {
            "type": "Blob",
            "name": "requestBody"
        }, {
            "type": "String",
            "name": "requestURI"
        }, {
            "type": "String",
            "name": "resourcePath"
        }],
        "constructors": [{
            "type": "void",
            "name": "RestRequest",
            "parameters": ["()"]
        }]
    },
    "ProcessSubmitRequest": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String",
            "name": "getObjectId",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getProcessDefinitionNameOrId",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "getSkipEntryCriteria",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getSubmitterId",
            "parameters": ["()"]
        }, {
            "type": "void",
            "name": "setObjectId",
            "parameters": ["(String Id)"]
        }, {
            "type": "void",
            "name": "setProcessDefinitionNameOrId",
            "parameters": ["(String)"]
        }, {
            "type": "void",
            "name": "setSkipEntryCriteria",
            "parameters": ["(Boolean entryCriteria)"]
        }, {
            "type": "void",
            "name": "setSubmitterId",
            "parameters": ["(String userID)"]
        }],
        "properties": [],
        "constructors": []
    },
    "ProcessWorkitemRequest": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String",
            "name": "getAction",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getWorkitemId",
            "parameters": ["()"]
        }, {
            "type": "void",
            "name": "setAction",
            "parameters": ["(String s)"]
        }, {
            "type": "void",
            "name": "setWorkitemId",
            "parameters": ["(String Id)"]
        }],
        "properties": [],
        "constructors": []
    },
    "JSON": {
        "staticMethods": [{
            "type": "System.JSONGenerator",
            "name": "createGenerator",
            "parameters": ["(Boolean pretty)"]
        }, {
            "type": "System.JSONParser",
            "name": "createParser",
            "parameters": ["(String jsonString)"]
        }, {
            "type": "Object",
            "name": "deserialize",
            "parameters": ["(String jsonString, System.Type apexType)"]
        }, {
            "type": "Object",
            "name": "deserializeStrict",
            "parameters": ["(String jsonString, System.Type apexType)"]
        }, {
            "type": "Object",
            "name": "deserializeUntyped",
            "parameters": ["(String jsonString)"]
        }, {
            "type": "String",
            "name": "serialize",
            "parameters": ["(anyType object)"]
        }, {
            "type": "String",
            "name": "serializePretty",
            "parameters": ["(Object anyType)"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "XmlStreamReader": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "Integer",
            "name": "getAttributeCount",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getAttributeLocalName",
            "parameters": ["(Integer index)"]
        }, {
            "type": "String",
            "name": "getAttributeNamespace",
            "parameters": ["(Integer index)"]
        }, {
            "type": "String",
            "name": "getAttributePrefix",
            "parameters": ["(Integer index)"]
        }, {
            "type": "String",
            "name": "getAttributeType",
            "parameters": ["(Integer index)"]
        }, {
            "type": "String",
            "name": "getAttributeValue",
            "parameters": ["(String namespaceURI, String localName)"]
        }, {
            "type": "String",
            "name": "getAttributeValueAt",
            "parameters": ["(Integer index)"]
        }, {
            "type": "System.XmlTag",
            "name": "getEventType",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getLocalName",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getLocation",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getNamespace",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getNamespaceCount",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getNamespacePrefix",
            "parameters": ["(Integer index)"]
        }, {
            "type": "String",
            "name": "getNamespaceURI",
            "parameters": ["(String Prefix)"]
        }, {
            "type": "String",
            "name": "getNamespaceURIAt",
            "parameters": ["(Integer Index)"]
        }, {
            "type": "String",
            "name": "getPIData",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getPITarget",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getPrefix",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getText",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getVersion",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "hasName",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "hasNext",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "hasText",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isCharacters",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isEndElement",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isStartElement",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isWhiteSpace",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "next",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "nextTag",
            "parameters": ["()"]
        }, {
            "type": "void",
            "name": "setCoalescing",
            "parameters": ["(Boolean returnAsSingleBlock)"]
        }, {
            "type": "void",
            "name": "setNamespaceAware",
            "parameters": ["(Boolean isNamespaceAware)"]
        }, {
            "type": "String",
            "name": "toString",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": [{
            "type": "void",
            "name": "XmlStreamReader",
            "parameters": ["(String xmlInput)"]
        }]
    },
    "List": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "void",
            "name": "List<T>",
            "parameters": ["()", "(List<T> listToCopy)", "(Set<T> setToCopy)"]
        }, {
            "type": "void",
            "name": "add",
            "parameters": ["(Object listElement)", "(Integer index, Object listElement)"]
        }, {
            "type": "void",
            "name": "addAll",
            "parameters": ["(List fromList)", "(Set fromSet)"]
        }, {
            "type": "void",
            "name": "clear",
            "parameters": ["()"]
        }, {
            "type": "List<Object>",
            "name": "clone",
            "parameters": ["()"]
        }, {
            "type": "List<Object>",
            "name": "deepClone",
            "parameters": ["(Boolean opt_preserve_id, Boolean opt_preserve_readonly_timestamps, Boolean opt_preserve_autonumber)"]
        }, {
            "type": "Boolean",
            "name": "equals",
            "parameters": ["(List list2)"]
        }, {
            "type": "Object",
            "name": "get",
            "parameters": ["(Integer index)"]
        }, {
            "type": "Schema.SObjectType",
            "name": "getSObjectType",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "hashCode",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isEmpty",
            "parameters": ["()"]
        }, {
            "type": "Iterator",
            "name": "iterator",
            "parameters": ["()"]
        }, {
            "type": "Object",
            "name": "remove",
            "parameters": ["(Integer index)"]
        }, {
            "type": "void",
            "name": "set",
            "parameters": ["(Integer index, Object listElement)"]
        }, {
            "type": "Integer",
            "name": "size",
            "parameters": ["()"]
        }, {
            "type": "void",
            "name": "sort",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "IdeaStandardController": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "IdeaComment[]",
            "name": "getCommentList",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "QuickActionRequest": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "Id",
            "name": "getContextId",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getQuickActionName",
            "parameters": ["()"]
        }, {
            "type": "SObject",
            "name": "getRecord",
            "parameters": ["()"]
        }, {
            "type": "void",
            "name": "setContextId",
            "parameters": ["(Id contextId)"]
        }, {
            "type": "void",
            "name": "setQuickActionName",
            "parameters": ["(String name)"]
        }, {
            "type": "void",
            "name": "setRecord",
            "parameters": ["(SObject record)"]
        }],
        "properties": [],
        "constructors": [{
            "type": "void",
            "name": "QuickActionRequest",
            "parameters": ["()"]
        }]
    },
    "Site": {
        "staticMethods": [{
            "type": "PageReference",
            "name": "changePassword",
            "parameters": ["(String newpassword, String verifynewpassword, String opt_oldpassword)"]
        }, {
            "type": "ID",
            "name": "createPersonAccountPortalUser",
            "parameters": ["(sObject user, String ownerId, String password)", "(sObject user, String ownerId, String recordTypeId, String password)"]
        }, {
            "type": "ID",
            "name": "createPortalUser",
            "parameters": ["(sObject user, String accountId, String opt_password, Boolean opt_sendEmailConfirmation)"]
        }, {
            "type": "Boolean",
            "name": "forgotPassword",
            "parameters": ["(String username)"]
        }, {
            "type": "String",
            "name": "getAdminEmail",
            "parameters": ["()"]
        }, {
            "type": "ID",
            "name": "getAdminId",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getAnalyticsTrackingCode",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getCurrentSiteUrl",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getBaseCustomUrl",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getBaseInsecureUrl",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getBaseRequestUrl",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getBaseSecureUrl",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getBaseUrl",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getCustomWebAddress",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getDomain",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getErrorDescription",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getErrorMessage",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getMasterLabel",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getName",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getOriginalUrl",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getPathPrefix",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getPrefix",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getSiteId",
            "parameters": ["()"]
        }, {
            "type": "PageReference",
            "name": "getTemplate",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getSiteType",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getSyteTypeLabel",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isLoginEnabled",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isPasswordExpired",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isRegistrationEnabled",
            "parameters": ["()"]
        }, {
            "type": "PageReference",
            "name": "login",
            "parameters": ["(String username, String password, String startUrl)"]
        }, {
            "type": "void",
            "name": "setPortalUserAsAuthProvider",
            "parameters": ["(sObject user, String contactId)"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "ProcessRequest": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String",
            "name": "getComments",
            "parameters": ["()"]
        }, {
            "type": "ID[]",
            "name": "getNextApproverIds",
            "parameters": ["()"]
        }, {
            "type": "void",
            "name": "setComments",
            "parameters": ["(String comments)"]
        }, {
            "type": "void",
            "name": "setNextApproverIds",
            "parameters": ["(ID[] nextApproverIds)"]
        }],
        "properties": [],
        "constructors": []
    },
    "StandardController": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "void",
            "name": "addFields",
            "parameters": ["(List<String> fieldNames)"]
        }, {
            "type": "PageReference",
            "name": "cancel",
            "parameters": ["()"]
        }, {
            "type": "PageReference",
            "name": "delete",
            "parameters": ["()"]
        }, {
            "type": "PageReference",
            "name": "edit",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getId",
            "parameters": ["()"]
        }, {
            "type": "SObject",
            "name": "getRecord",
            "parameters": ["()"]
        }, {
            "type": "void",
            "name": "reset",
            "parameters": ["()"]
        }, {
            "type": "PageReference",
            "name": "save",
            "parameters": ["()"]
        }, {
            "type": "PageReference",
            "name": "view",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": [{
            "type": "void",
            "name": "StandardController",
            "parameters": ["(SObject controllerSObject)"]
        }]
    },
    "Ideas": {
        "staticMethods": [{
            "type": "ID[]",
            "name": "findSimilar",
            "parameters": ["(Idea idea)"]
        }, {
            "type": "ID[]",
            "name": "getAllRecentReplies",
            "parameters": ["(String userID, String communityID)"]
        }, {
            "type": "ID[]",
            "name": "getReadRecentReplies",
            "parameters": ["(String userID, String communityID)"]
        }, {
            "type": "ID[]",
            "name": "getUnreadRecentReplies",
            "parameters": ["(String userID, String communityID)"]
        }, {
            "type": "void",
            "name": "markRead",
            "parameters": ["(String ideaID)"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "SelectOption": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "Boolean",
            "name": "getDisabled",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "getEscapeItem",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getLabel",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getValue",
            "parameters": ["()"]
        }, {
            "type": "void",
            "name": "setDisabled",
            "parameters": ["(Boolean isDisabled)"]
        }, {
            "type": "void",
            "name": "setEscapeItem",
            "parameters": ["(Boolean itemsEscaped)"]
        }, {
            "type": "void",
            "name": "setLabel",
            "parameters": ["(String label)"]
        }, {
            "type": "void",
            "name": "setValue",
            "parameters": ["(String value)"]
        }],
        "properties": [],
        "constructors": [{
            "type": "void",
            "name": "SelectOption",
            "parameters": ["(String value, String label)", "(String value, String label, Boolean isDisabled)"]
        }]
    },
    "Map": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "void",
            "name": "Map<T1,T2>",
            "parameters": ["()", "(Map<T1,T2> mapToCopy)"]
        }, {
            "type": "void",
            "name": "Map<ID,sObject>",
            "parameters": ["(List<sObject> recordList)"]
        }, {
            "type": "void",
            "name": "clear",
            "parameters": ["()"]
        }, {
            "type": "Map<Object, Object>",
            "name": "clone",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "containsKey",
            "parameters": ["(Object key)"]
        }, {
            "type": "Map<Object, Object>",
            "name": "deepClone",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "equals",
            "parameters": ["(Map map2)"]
        }, {
            "type": "Object",
            "name": "get",
            "parameters": ["(Object key)"]
        }, {
            "type": "Schema.SObjectType",
            "name": "getSObjectType",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "hashCode",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isEmpty",
            "parameters": ["()"]
        }, {
            "type": "Set<Object>",
            "name": "keySet",
            "parameters": ["()"]
        }, {
            "type": "Object",
            "name": "put",
            "parameters": ["(Object key, Object value)"]
        }, {
            "type": "void",
            "name": "putAll",
            "parameters": ["(Map fromMap)", "(sObject[] sobjectArray)"]
        }, {
            "type": "Object",
            "name": "remove",
            "parameters": ["(Key key)"]
        }, {
            "type": "Integer",
            "name": "size",
            "parameters": ["()"]
        }, {
            "type": "List<Object>",
            "name": "values",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "Set": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "void",
            "name": "Set<T>",
            "parameters": ["()", "(Set<T> setToCopy)", "(List<T> listToCopy)"]
        }, {
            "type": "Boolean",
            "name": "add",
            "parameters": ["(Object setElement)"]
        }, {
            "type": "Boolean",
            "name": "addAll",
            "parameters": ["(List<Object> fromList)", "(Set<Object> fromSet)"]
        }, {
            "type": "void",
            "name": "clear",
            "parameters": ["()"]
        }, {
            "type": "Set<Object>",
            "name": "clone",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "contains",
            "parameters": ["(Object setElement)"]
        }, {
            "type": "Boolean",
            "name": "containsAll",
            "parameters": ["(List<Object> listToCompare)", "(Set<Object> setToCompare)"]
        }, {
            "type": "Boolean",
            "name": "equals",
            "parameters": ["(Set<Object> set2)"]
        }, {
            "type": "Integer",
            "name": "hashCode",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isEmpty",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "remove",
            "parameters": ["(Object setElement)"]
        }, {
            "type": "Boolean",
            "name": "removeAll",
            "parameters": ["(List<Object> listOfElementsToRemove)", "(Set<Object> setOfElementsToRemove)"]
        }, {
            "type": "Boolean",
            "name": "retainAll",
            "parameters": ["(List<Object> listOfElementsToRetain)", "(Set setOfElementsToRetain)"]
        }, {
            "type": "Integer",
            "name": "size",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "PageReference": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String",
            "name": "getAnchor",
            "parameters": ["()"]
        },{
            "type": "Blob",
            "name": "getContent",
            "parameters": ["()"]
        },{
            "type": "Blob",
            "name": "getContentAsPDF",
            "parameters": ["()"]
        },{
            "type": "Map",
            "name": "getCookies",
            "parameters": ["()"]
        },{
            "type": "Map",
            "name": "getHeaders",
            "parameters": ["()"]
        },{
            "type": "Map",
            "name": "getParameters",
            "parameters": ["()"]
        },{
            "type": "Boolean",
            "name": "getRedirect",
            "parameters": ["()"]
        },{
            "type": "String",
            "name": "getUrl",
            "parameters": ["()"]
        },{
            "type": "PageReference",
            "name": "setAnchor",
            "parameters": ["(String anchor)"]
        },{
            "type": "void",
            "name": "setCookies",
            "parameters": ["(Cookie[] cookies)"]
        },{
            "type": "PageReference",
            "name": "setRedirect",
            "parameters": ["(Boolean redirect)"]
        }],
        "properties": [],
        "constructors": []
    },    
    "IdeaStandardSetController": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "Idea[]",
            "name": "getIdeaList",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "Limits": {
        "staticMethods": [{
            "type": "Integer",
            "name": "getAggregateQueries",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getLimitAggregateQueries",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getCallouts",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getLimitCallouts",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getChildRelationshipsDescribes",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getLimitChildRelationshipsDescribes",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getCpuTime",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getLimitCpuTime",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getDMLRows",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getLimitDMLRows",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getDMLStatements",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getLimitDMLStatements",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getEmailInvocations",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getLimitEmailInvocations",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getFieldsDescribes",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getLimitFieldsDescribes",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getFieldSetsDescribes",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getLimitFieldSetsDescribes",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getFindSimilarCalls",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getLimitFindSimilarCalls",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getFutureCalls",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getLimitFutureCalls",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getHeapSize",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getLimitHeapSize",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getMobilePushApexCalls",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getLimitMobilePushApexCalls",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getPicklistDescribes",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getLimitPicklistDescribes",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getQueries",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getLimitQueries",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getQueryLocatorRows",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getLimitQueryLocatorRows",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getQueryRows",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getLimitQueryRows",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getQueueableJobs",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getLimitQueueableJobs",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getRecordTypesDescribes",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getLimitRecordTypesDescribes",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getRunAs",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getLimitRunAs",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getSavepointRollbacks",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getLimitSavepointRollbacks",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getSavepoints",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getLimitSavepoints",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getScriptStatements",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getLimitScriptStatements",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getSoslQueries",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getLimitSoslQueries",
            "parameters": ["()"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "Test": {
        "staticMethods": [{
            "type": "Id",
            "name": "getStandardPricebookId",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isRunningTest",
            "parameters": ["()"]
        }, {
            "type": "List<sObject>",
            "name": "loadData",
            "parameters": ["(Schema.SObjectType sObjectToken, String resourceName)"]
        }, {
            "type": "void",
            "name": "setCurrentPage",
            "parameters": ["(PageReference page)"]
        }, {
            "type": "void",
            "name": "setCurrentPageReference",
            "parameters": ["(PageReference page)"]
        }, {
            "type": "void",
            "name": "setFixedSearchResults",
            "parameters": ["(ID[] opt_set_search_results)"]
        }, {
            "type": "void",
            "name": "setMock",
            "parameters": ["(Type interfaceType, Object instance)"]
        }, {
            "type": "void",
            "name": "setReadOnlyApplicationMode",
            "parameters": ["(Boolean application_mode)"]
        }, {
            "type": "void",
            "name": "startTest",
            "parameters": ["()"]
        }, {
            "type": "void",
            "name": "stopTest",
            "parameters": ["()"]
        }, {
            "type": "void",
            "name": "testInstall",
            "parameters": ["(InstallHandler installImp, Version ver, Boolean isPush)"]
        }, {
            "type": "void",
            "name": "testUninstall",
            "parameters": ["(UninstallHandler uninstImp)"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "HttpRequest": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String",
            "name": "getBody",
            "parameters": ["()"]
        }, {
            "type": "Blob",
            "name": "getBodyAsBlob",
            "parameters": ["()"]
        }, {
            "type": "Dom.Document",
            "name": "getBodyDocument",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "getCompressed",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getEndpoint",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getHeader",
            "parameters": ["(String key)"]
        }, {
            "type": "String",
            "name": "getMethod",
            "parameters": ["()"]
        }, {
            "type": "void",
            "name": "setBody",
            "parameters": ["(String body)"]
        }, {
            "type": "void",
            "name": "setBodyAsBlob",
            "parameters": ["(Blob body)"]
        }, {
            "type": "void",
            "name": "setBodyDocument",
            "parameters": ["(Dom.Document document)"]
        }, {
            "type": "void",
            "name": "setClientCertificate",
            "parameters": ["(String clientCert, String password)"]
        }, {
            "type": "void",
            "name": "setClientCertificateName",
            "parameters": ["(String certDevName)"]
        }, {
            "type": "void",
            "name": "setCompressed",
            "parameters": ["(Boolean flag)"]
        }, {
            "type": "void",
            "name": "setEndpoint",
            "parameters": ["(String endpoint)"]
        }, {
            "type": "void",
            "name": "setHeader",
            "parameters": ["(String key, String Value)"]
        }, {
            "type": "void",
            "name": "setMethod",
            "parameters": ["(String method)"]
        }, {
            "type": "void",
            "name": "setTimeout",
            "parameters": ["(Integer timeout)"]
        }, {
            "type": "String",
            "name": "toString",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": [{
            "type": "void",
            "name": "HttpRequest",
            "parameters": ["()"]
        }]
    },
    "HttpResponse": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String",
            "name": "getBody",
            "parameters": ["()"]
        }, {
            "type": "Blob",
            "name": "getBodyAsBlob",
            "parameters": ["()"]
        }, {
            "type": "Dom.Document",
            "name": "getBodyDocument",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getHeader",
            "parameters": ["(String key)"]
        }, {
            "type": "String[]",
            "name": "getHeaderKeys",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getStatus",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getStatusCode",
            "parameters": ["()"]
        }, {
            "type": "XmlStreamReader",
            "name": "getXmlStreamReader",
            "parameters": ["()"]
        }, {
            "type": "void",
            "name": "setBody",
            "parameters": ["(String body)"]
        }, {
            "type": "void",
            "name": "setBodyAsBlob",
            "parameters": ["(Blob body)"]
        }, {
            "type": "void",
            "name": "setHeader",
            "parameters": ["(String key, String value)"]
        }, {
            "type": "void",
            "name": "setStatus",
            "parameters": ["(String status)"]
        }, {
            "type": "void",
            "name": "setStatusCode",
            "parameters": ["(Integer statusCode)"]
        }, {
            "type": "String",
            "name": "toString",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "Action": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String",
            "name": "getExpression",
            "parameters": ["()"]
        }, {
            "type": "PageReference",
            "name": "invoke",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": [{
            "type": "void",
            "name": "Action",
            "parameters": ["(String action)"]
        }]
    },
    "ChatterGroups": {
        "staticMethods": [{
            "type": "ConnectApi.GroupMember",
            "name": "addMember",
            "parameters": ["(String communityId, String groupId, String userId)"]
        }, {
            "type": "ConnectApi.GroupMember",
            "name": "addMemberWithRole",
            "parameters": ["(String communityId, String groupId, String userId, ConnectApi.GroupMembershipType role)"]
        }, {
            "type": "ConnectApi.ChatterGroupDetail",
            "name": "createGroup",
            "parameters": ["(String, communityId, ConnectApi.ChatterGroupInput groupInput)"]
        }, {
            "type": "void",
            "name": "deleteMember",
            "parameters": ["(String communityId, String membershipId)"]
        }, {
            "type": "void",
            "name": "deletePhoto",
            "parameters": ["(String communityId, String groupId)"]
        }, {
            "type": "ConnectApi.AnnouncementPage",
            "name": "getAnnouncements",
            "parameters": ["(String communityId, String groupId)", "(String communityId, String groupId, Integer pageParam, Integer pageSize)"]
        }, {
            "type": "ConnectApi.ChatterGroupDetail",
            "name": "getGroup",
            "parameters": ["(String communityId, String groupId)"]
        }, {
            "type": "ConnectApi.BatchResult[]",
            "name": "getGroupBatch",
            "parameters": ["(String communityId, List<String> groupIds)"]
        }, {
            "type": "ConnectApi.GroupMembershipRequest",
            "name": "getGroupMembershipRequest",
            "parameters": ["(String communityId, String requestId)"]
        }, {
            "type": "ConnectApi.GroupMembershipRequests",
            "name": "getGroupMembershipRequests",
            "parameters": ["(String communityId, String groupId)", "(String communityId, String groupId, ConnectApi.GroupMembershipRequestStatus status)"]
        }, {
            "type": "ConnectApi.ChatterGroupPage",
            "name": "getGroups",
            "parameters": ["(String communityId)", "(String communityId, Integer pageParam, Integer pageSize)", "(String communityId, Integer pageParam, Integer pageSize, ConnectApi.GroupArchiveStatus archiveStatus)"]
        }, {
            "type": "ConnectApi.GroupMember",
            "name": "getMember",
            "parameters": ["(String communityId, String membershipId)"]
        }, {
            "type": "ConnectApi.GroupMemberPage",
            "name": "getMembers",
            "parameters": ["(String communityId, String groupId)", "(String communityId, String groupId, Integer pageParam, Integer pageSize)"]
        }, {
            "type": "ConnectApi.BatchResult[]",
            "name": "getMembershipBatch",
            "parameters": ["(String communityId, List<String> membershipIds)"]
        }, {
            "type": "ConnectApi.GroupChatterSettings",
            "name": "getMyChatterSettings",
            "parameters": ["(String communityId, String groupId)"]
        }, {
            "type": "ConnectApi.Photo",
            "name": "getPhoto",
            "parameters": ["(String communityId, String groupId)"]
        }, {
            "type": "ConnectApi.Announcement",
            "name": "postAnnouncement",
            "parameters": ["(String communityId, String groupId, ConnectApi.AnnouncementInput announcement)"]
        }, {
            "type": "ConnectApi.GroupMembershipRequest",
            "name": "requestGroupMembership",
            "parameters": ["(String communityId, String groupId)"]
        }, {
            "type": "ConnectApi.ChatterGroupPage",
            "name": "searchGroups",
            "parameters": ["(String communityId, String q)", "(String communityId, String q, Integer pageParam, Integer pageSize)", "(String communityId, String q, ConnectApi.GroupArchiveStatus archiveStatus, Integer pageParam, Integer pageSize)"]
        }, {
            "type": "ConnectApi.Photo",
            "name": "setPhoto",
            "parameters": ["(String communityId, String groupId, String fileId, Integer versionNumber)", "(String communityId, String groupId, ConnectApi.BinaryInput fileUpload)"]
        }, {
            "type": "ConnectApi.Photo",
            "name": "setPhotoWithAttributes",
            "parameters": ["(String communityId, String groupId, ConnectApi.PhotoInput photo)", "(String communityId, String groupId, ConnectApi.PhotoInput photo, ConnectApi.BinaryInput fileUpload)"]
        }, {
            "type": "ConnectApi.ChatterGroup",
            "name": "updateGroup",
            "parameters": ["(String communityId, String groupId, ConnectApi.ChatterGroupInput groupInput)"]
        }, {
            "type": "ConnectApi.ChatterGroup",
            "name": "updateGroupMember",
            "parameters": ["(String communityId, String membershipId, ConnectApi.GroupMembershipType role)"]
        }, {
            "type": "ConnectApi.GroupChatterSettings",
            "name": "updateMyChatterSettings",
            "parameters": ["(String communityId, String groupId, ConnectApi.GroupEmailFrequency emailFrequency)"]
        }, {
            "type": "ConnectApi.GroupMembershipRequest",
            "name": "updateRequestStatus",
            "parameters": ["(String communityId, String requestId, ConnectApi.GroupMembershipRequestStatus status)"]
        }, {
            "type": "void",
            "name": "setTestSearchGroups",
            "parameters": ["(String communityId, String q, ConnectApi.ChatterGroupPage result)", "(String communityId, String q, Integer pageParam, Integer pageSize, ConnectApi.ChatterGroupPage result)", "(String communityId, String q, ConnectApi.GroupArchiveStatus, archiveStatus, Integer pageParam, Integer pageSize, ConnectApi.ChatterGroupPage result)"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "ReportFilter": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String",
            "name": "getColumn",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getOperator",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getValue",
            "parameters": ["()"]
        }, {
            "type": "void",
            "name": "setColumn",
            "parameters": ["(String column)"]
        }, {
            "type": "void",
            "name": "setOperator",
            "parameters": ["(String operator)"]
        }, {
            "type": "void",
            "name": "setValue",
            "parameters": ["(String value)"]
        }],
        "properties": [],
        "constructors": [{
            "type": "void",
            "name": "ReportFilter",
            "parameters": ["()", "(String, String, String)"]
        }]
    },
    "LeadConvert": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "ID",
            "name": "getAccountId",
            "parameters": ["()"]
        }, {
            "type": "ID",
            "name": "getContactId",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getConvertedStatus",
            "parameters": ["()"]
        }, {
            "type": "ID",
            "name": "getLeadID",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getOpportunityName",
            "parameters": ["()"]
        }, {
            "type": "ID",
            "name": "getOwnerID",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isDoNotCreateOpportunity",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isOverWriteLeadSource",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isSendNotificationEmail",
            "parameters": ["()"]
        }, {
            "type": "void",
            "name": "setAccountId",
            "parameters": ["(ID accountID)"]
        }, {
            "type": "void",
            "name": "setContactId",
            "parameters": ["(ID contactID)"]
        }, {
            "type": "void",
            "name": "setConvertedStatus",
            "parameters": ["(String Status)"]
        }, {
            "type": "void",
            "name": "setDoNotCreateOpportunity",
            "parameters": ["(Boolean createOpportunity)"]
        }, {
            "type": "void",
            "name": "setLeadId",
            "parameters": ["(ID leadID)"]
        }, {
            "type": "void",
            "name": "setOpportunityName",
            "parameters": ["(String OppName)"]
        }, {
            "type": "void",
            "name": "setOverwriteLeadSource",
            "parameters": ["(Boolean overwriteLeadSource)"]
        }, {
            "type": "void",
            "name": "setOwnerId",
            "parameters": ["(ID ownerID)"]
        }, {
            "type": "void",
            "name": "setSendNotificationEmail",
            "parameters": ["(Boolean sendEmail)"]
        }],
        "properties": [],
        "constructors": [{
            "type": "void",
            "name": "LeadConvert",
            "parameters": ["()"]
        }]
    },
    "StaticResourceCalloutMock": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "void",
            "name": "setHeader",
            "parameters": ["(String headerName, String headerValue)"]
        }, {
            "type": "void",
            "name": "setStaticResource",
            "parameters": ["(String resourceName)"]
        }, {
            "type": "void",
            "name": "setStatus",
            "parameters": ["(String httpStatus)"]
        }, {
            "type": "void",
            "name": "setStatusCode",
            "parameters": ["(Integer httpStatusCode)"]
        }],
        "properties": [],
        "constructors": [{
            "type": "void",
            "name": "StaticResourceCalloutMock",
            "parameters": ["()"]
        }]
    },
    "MultiStaticResourceCalloutMock": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "void",
            "name": "setHeader",
            "parameters": ["(String headerName, String headerValue)"]
        }, {
            "type": "void",
            "name": "setStaticResource",
            "parameters": ["(String endpoint, String resourceName)"]
        }, {
            "type": "void",
            "name": "setStatus",
            "parameters": ["(String httpStatus)"]
        }, {
            "type": "void",
            "name": "setStatusCode",
            "parameters": ["(Integer httpStatusCode)"]
        }],
        "properties": [],
        "constructors": [{
            "type": "void",
            "name": "MultiStaticResourceCalloutMock",
            "parameters": ["()"]
        }]
    },
    "Interview": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "Object",
            "name": "getVariableValue",
            "parameters": ["(String variableName)"]
        }, {
            "type": "void",
            "name": "start",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "MassEmailMessage": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "void",
            "name": "setDescription",
            "parameters": ["(String description)"]
        }, {
            "type": "void",
            "name": "setTargetObjectIds",
            "parameters": ["(ID[] targetObjectIds)"]
        }, {
            "type": "void",
            "name": "setWhatIds",
            "parameters": ["(ID[] whatIds)"]
        }],
        "properties": [],
        "constructors": [{
            "type": "void",
            "name": "MassEmailMessage",
            "parameters": ["()"]
        }]
    },
    "DescribeSObjectResult": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "Schema.SObjectTypeFields",
            "name": "fields",
            "parameters": ["()"]
        }, {
            "type": "Schema.SObjectTypeFields",
            "name": "fieldSets",
            "parameters": ["()"]
        }, {
            "type": "Schema.ChildRelationship",
            "name": "getChildRelationships",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getKeyPrefix",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getLabel",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getLabelPlural",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getLocalName",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getName",
            "parameters": ["()"]
        }, {
            "type": "List<Schema.RecordTypeInfo>",
            "name": "getRecordTypeInfos",
            "parameters": ["()"]
        }, {
            "type": "Schema.RecordTypeInfo",
            "name": "getRecordTypeInfosById",
            "parameters": ["()"]
        }, {
            "type": "Schema.RecordTypeInfo",
            "name": "getRecordTypeInfosByName",
            "parameters": ["()"]
        }, {
            "type": "Schema.SObjectType",
            "name": "getSobjectType",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isAccessible",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isCreateable",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isCustom",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isCustomSetting",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isDeletable",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isDeprecatedAndHidden",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isFeedEnabled",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isMergeable",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isQueryable",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isSearchable",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isUndeletable",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isUpdateable",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "ProcessResult": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String",
            "name": "getEntityId",
            "parameters": ["()"]
        }, {
            "type": "Database.Error[]",
            "name": "getErrors",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getInstanceId",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getInstanceStatus",
            "parameters": ["()"]
        }, {
            "type": "ID[]",
            "name": "getNewWorkitemIds",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isSuccess",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "TimeZone": {
        "staticMethods": [{
            "type": "TimeZone",
            "name": "getTimeZone",
            "parameters": ["(String Id)"]
        }],
        "instanceMethods": [{
            "type": "String",
            "name": "getDisplayName",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getID",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getOffset",
            "parameters": ["(Datetime date)"]
        }, {
            "type": "String",
            "name": "toString",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "RestResponse": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "void",
            "name": "addHeader",
            "parameters": ["(String name, String value)"]
        }],
        "properties": [{
            "type": "Blob",
            "name": "responseBody"
        }, {
            "type": "Map<String, String>",
            "name": "headers"
        }, {
            "type": "Integer",
            "name": "statuscode"
        }],
        "constructors": [{
            "type": "void",
            "name": "RestResponse",
            "parameters": ["()"]
        }]
    },
    "FieldSet": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String",
            "name": "getDescription",
            "parameters": ["()"]
        }, {
            "type": "List<FieldSetMember>",
            "name": "getFields",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getLabel",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getName",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getNamespace",
            "parameters": ["()"]
        }, {
            "type": "Schema.SObjectType",
            "name": "getSObjectType",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "Network": {
        "staticMethods": [{
            "type": "String",
            "name": "communitiesLanding",
            "parameters": ["()"]
        }, {
            "type": "PageReference",
            "name": "forwardToAuthPage",
            "parameters": ["(String startURL)"]
        }, {
            "type": "String",
            "name": "getLoginUrl",
            "parameters": ["(String networkId)"]
        }, {
            "type": "String",
            "name": "getLogoutUrl",
            "parameters": ["(String networkId)"]
        }, {
            "type": "String",
            "name": "getNetworkId",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getSelfRegUrl",
            "parameters": ["(String networkId)"]
        }, {
            "type": "Integer",
            "name": "loadAllPackageDefaultNetworkDashboardSettings",
            "parameters": ["()"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": [{
            "type": "void",
            "name": "Network",
            "parameters": ["()"]
        }]
    },
    "PluginResult": {
        "staticMethods": [],
        "instanceMethods": [],
        "properties": [{
            "type": "MAP<String, ANY>",
            "name": "outputParameters"
        }],
        "constructors": []
    },
    "Document": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "Dom.XmlNode",
            "name": "createRootElement",
            "parameters": ["(String name, String namespace, String prefix)"]
        }, {
            "type": "Dom.XmlNode",
            "name": "getRootElement",
            "parameters": ["()"]
        }, {
            "type": "void",
            "name": "load",
            "parameters": ["(String xml)"]
        }, {
            "type": "String",
            "name": "toXmlString",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": [{
            "type": "void",
            "name": "Document",
            "parameters": ["()"]
        }]
    },
    "PluginRequest": {
        "staticMethods": [],
        "instanceMethods": [],
        "properties": [{
            "type": "MAP<String,ANY>",
            "name": "inputParameters"
        }],
        "constructors": []
    },
    "PublishingService": {
        "staticMethods": [{
            "type": "void",
            "name": "archiveOnlineArticle",
            "parameters": ["(String articleId, Datetime scheduledDate)"]
        }, {
            "type": "void",
            "name": "assignDraftArticleTask",
            "parameters": ["(String articleId, String assigneeID, String instructions, Datetime dueDate, Boolean sendEmailNotification)"]
        }, {
            "type": "void",
            "name": "assignDraftTranslationTask",
            "parameters": ["(String articleVersionId, String assigneeID, String instructions, Datetime dueDate, Boolean sendEmailNotification)"]
        }, {
            "type": "void",
            "name": "cancelScheduledArchivingOfArticle",
            "parameters": ["(String articleId)"]
        }, {
            "type": "void",
            "name": "cancelScheduledPublicationOfArticle",
            "parameters": ["(String articleId)"]
        }, {
            "type": "void",
            "name": "completeTranslation",
            "parameters": ["(String articleVersionId)"]
        }, {
            "type": "void",
            "name": "deleteArchivedArticle",
            "parameters": ["(String articleId)"]
        }, {
            "type": "void",
            "name": "deleteArchivedArticleVersion",
            "parameters": ["(String articleId, Integer versionNumber)"]
        }, {
            "type": "void",
            "name": "deleteDraftArticle",
            "parameters": ["(String articleId)"]
        }, {
            "type": "void",
            "name": "deleteDraftTranslation",
            "parameters": ["(String articleVersionId)"]
        }, {
            "type": "String",
            "name": "editArchivedArticle",
            "parameters": ["(String articleId)"]
        }, {
            "type": "String",
            "name": "editOnlineArticle",
            "parameters": ["(String articleId, Boolean unpublish)"]
        }, {
            "type": "String",
            "name": "editPublishedTranslation",
            "parameters": ["(String articleId, String language, Boolean unpublish)"]
        }, {
            "type": "void",
            "name": "publishArticle",
            "parameters": ["(String articleId, Boolean flagAsNew)"]
        }, {
            "type": "String",
            "name": "restoreOldVersion",
            "parameters": ["(String articleId, Integer versionNumber)"]
        }, {
            "type": "void",
            "name": "scheduleForPublication",
            "parameters": ["(String articleId, Datetime scheduledDate)"]
        }, {
            "type": "void",
            "name": "setTranslationToIncomplete",
            "parameters": ["(String articleVersionId)"]
        }, {
            "type": "String",
            "name": "submitForTranslation",
            "parameters": ["(String articleId, String language, String assigneeID, Datetime dueDate)"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "CommunityModeration": {
        "staticMethods": [{
            "type": "ConnectApi.ModerationFlags",
            "name": "addFlagToComment",
            "parameters": ["(String communityId, String commentId)", "(String communityId, String commentId, ConnectApi.CommunityFlagVisibility visibility)"]
        }, {
            "type": "ConnectApi.ModerationCapability",
            "name": "addFlagToFeedElement",
            "parameters": ["(String communityId, String feedElementId)", "(String communityId, String feedElementId, ConnectApi.CommunityFlagVisibility visibility)"]
        }, {
            "type": "ConnectApi.ModerationFlags",
            "name": "addFlagToFeedItem",
            "parameters": ["(String communityId, String feedItemId)", "(String communityId, String feedItemId, ConnectApi.CommunityFlagVisibility visibility)"]
        }, {
            "type": "ConnectApi.ModerationFlags",
            "name": "getFlagsOnComment",
            "parameters": ["(String communityId, String commentId)", "(String communityId, String commentId, ConnectApi.CommunityFlagVisibility visibility)"]
        }, {
            "type": "ConnectApi.ModerationCapability",
            "name": "getFlagsOnFeedElement",
            "parameters": ["(String communityId, String feedElementId)", "(String communityId, String feedElementId, ConnectApi.CommunityFlagVisibility visibility)"]
        }, {
            "type": "ConnectApi.ModerationFlags",
            "name": "getFlagsOnFeedItem",
            "parameters": ["(String communityId, String feedItemId)", "(String communityId, String feedItemId, ConnectApi.CommunityFlagVisibility visibility)"]
        }, {
            "type": "ConnectApi.ModerationFlags",
            "name": "removeFlagsOnComment",
            "parameters": ["(String communityId, String commentId, String userId)"]
        }, {
            "type": "void",
            "name": "removeFlagFromFeedElement",
            "parameters": ["(String communityId, String feedElementId, String userId)"]
        }, {
            "type": "ConnectApi.ModerationFlags",
            "name": "removeFlagsOnFeedItem",
            "parameters": ["(String communityId, String feedItemId, String userId)"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "String": {
        "staticMethods": [{
            "type": "String",
            "name": "escapeSingleQuotes",
            "parameters": ["(String stringToEscape)"]
        }, {
            "type": "String",
            "name": "format",
            "parameters": ["(String stringToFormat, List<String> formattingArguments)"]
        }, {
            "type": "String",
            "name": "fromCharArray",
            "parameters": ["(List<Integer> charArray)"]
        }, {
            "type": "String",
            "name": "getCommonPrefix",
            "parameters": ["(List<String> strings)"]
        }, {
            "type": "Boolean",
            "name": "isBlank",
            "parameters": ["(String inputString)"]
        }, {
            "type": "Boolean",
            "name": "isEmpty",
            "parameters": ["(String inputString)"]
        }, {
            "type": "Boolean",
            "name": "isNotBlank",
            "parameters": ["(String inputString)"]
        }, {
            "type": "Boolean",
            "name": "isNotEmpty",
            "parameters": ["(String inputString)"]
        }, {
            "type": "String",
            "name": "join",
            "parameters": ["(Object iterableObj, String separator)"]
        }, {
            "type": "String",
            "name": "valueOf",
            "parameters": ["(Date dateToConvert)", "(Datetime datetimeToConvert)", "(Decimal decimalToConvert)", "(Double doubleToConvert)", "(Integer integerToConvert)", "(Long longToConvert)", "(Object toConvert)"]
        }, {
            "type": "String",
            "name": "valueOfGmt",
            "parameters": ["(Datetime datetimeToConvert)"]
        }],
        "instanceMethods": [{
            "type": "String",
            "name": "abbreviate",
            "parameters": ["(Integer maxWidth)", "(Integer maxWidth, Integer offset)"]
        }, {
            "type": "String",
            "name": "capitalize",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "center",
            "parameters": ["(Integer size)", "(Integer size, String padStr)"]
        }, {
            "type": "Integer",
            "name": "charAt",
            "parameters": ["(Integer index)"]
        }, {
            "type": "Integer",
            "name": "codePointAt",
            "parameters": ["(Integer index)"]
        }, {
            "type": "Integer",
            "name": "codePointBefore",
            "parameters": ["(Integer index)"]
        }, {
            "type": "Integer",
            "name": "codePointCount",
            "parameters": ["(Integer beginIndex, Integer endIndex)"]
        }, {
            "type": "Integer",
            "name": "compareTo",
            "parameters": ["(String compString)"]
        }, {
            "type": "Boolean",
            "name": "contains",
            "parameters": ["(String compString)"]
        }, {
            "type": "Boolean",
            "name": "containsAny",
            "parameters": ["(String compString)"]
        }, {
            "type": "Boolean",
            "name": "containsIgnoreCase",
            "parameters": ["(String compString)"]
        }, {
            "type": "Boolean",
            "name": "containsNone",
            "parameters": ["(String compString)"]
        }, {
            "type": "Boolean",
            "name": "containsOnly",
            "parameters": ["(String compString)"]
        }, {
            "type": "Boolean",
            "name": "containsWhitespace",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "countMatches",
            "parameters": ["(String compString)"]
        }, {
            "type": "String",
            "name": "deleteWhitespace",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "difference",
            "parameters": ["(String compString)"]
        }, {
            "type": "Boolean",
            "name": "endsWith",
            "parameters": ["(String suffix)"]
        }, {
            "type": "Boolean",
            "name": "endsWithIgnoreCase",
            "parameters": ["(String suffix)"]
        }, {
            "type": "Boolean",
            "name": "equals",
            "parameters": ["(String compString)"]
        }, {
            "type": "Boolean",
            "name": "equalsIgnoreCase",
            "parameters": ["(String compString)"]
        }, {
            "type": "String",
            "name": "escapeCsv",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "escapeEcmaScript",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "escapeHtml3",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "escapeHtml4",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "escapeJava",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "escapeUnicode",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "escapeXml",
            "parameters": ["()"]
        }, {
            "type": "List<Integer>",
            "name": "getChars",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getLevenshteinDistance",
            "parameters": ["(String stringToCompare)", "(String stringToCompare, Integer threshold)"]
        }, {
            "type": "Integer",
            "name": "hashCode",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "indexOf",
            "parameters": ["(String subString)", "(String substring, Integer index)"]
        }, {
            "type": "Integer",
            "name": "indexOfAny",
            "parameters": ["(String substring)"]
        }, {
            "type": "Integer",
            "name": "indexOfAnyBut",
            "parameters": ["(String substring)"]
        }, {
            "type": "Integer",
            "name": "indexOfChar",
            "parameters": ["(Integer character)", "(Integer character, Integer startIndex)", "(Integer character)"]
        }, {
            "type": "Integer",
            "name": "indexOfDifference",
            "parameters": ["(String stringToCompare)"]
        }, {
            "type": "Integer",
            "name": "indexOfIgnoreCase",
            "parameters": ["(String substring)", "(String substring, Integer startPosition)"]
        }, {
            "type": "Boolean",
            "name": "isAllLowerCase",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isAllUpperCase",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isAlpha",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isAlphaSpace",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isAlphanumeric",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isAlphanumericSpace",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isAsciiPrintable",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isNumeric",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isNumericSpace",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isWhitespace",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "lastIndexOf",
            "parameters": ["(String substring)", "(String substring, Integer endPosition)"]
        }, {
            "type": "Integer",
            "name": "lastIndexOfChar",
            "parameters": ["(Integer character, Integer endIndex)"]
        }, {
            "type": "Integer",
            "name": "lastIndexOfIgnoreCase",
            "parameters": ["(String substring)", "(String substring, Integer endPosition)"]
        }, {
            "type": "String",
            "name": "left",
            "parameters": ["(Integer length)"]
        }, {
            "type": "String",
            "name": "leftPad",
            "parameters": ["(Integer length)"]
        }, {
            "type": "Integer",
            "name": "length",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "mid",
            "parameters": ["(Integer startIndex, Integer length)"]
        }, {
            "type": "String",
            "name": "normalizeSpace",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "offsetByCodePoints",
            "parameters": ["(Integer index, Integer codePointOffset)"]
        }, {
            "type": "String",
            "name": "remove",
            "parameters": ["(String substring)"]
        }, {
            "type": "String",
            "name": "removeEnd",
            "parameters": ["(String substring)"]
        }, {
            "type": "String",
            "name": "removeEndIgnoreCase",
            "parameters": ["(String substring)"]
        }, {
            "type": "String",
            "name": "removeStart",
            "parameters": ["(String substring)"]
        }, {
            "type": "String",
            "name": "removeStartIgnoreCase",
            "parameters": ["(String substring)"]
        }, {
            "type": "String",
            "name": "repeat",
            "parameters": ["(Integer numTimes)", "(String separator, Integer numTimes)"]
        }, {
            "type": "String",
            "name": "replace",
            "parameters": ["(String target, String replacement)"]
        }, {
            "type": "String",
            "name": "replaceAll",
            "parameters": ["(String regExp, String replacement)"]
        }, {
            "type": "String",
            "name": "replaceFirst",
            "parameters": ["(String regExp, String replacement)"]
        }, {
            "type": "String",
            "name": "reverse",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "right",
            "parameters": ["(Integer length)"]
        }, {
            "type": "String",
            "name": "rightPad",
            "parameters": ["(Integer length)"]
        }, {
            "type": "String[]",
            "name": "split",
            "parameters": ["(String regExp, Integer limit)"]
        }, {
            "type": "List<String>",
            "name": "splitByCharacterType",
            "parameters": ["()"]
        }, {
            "type": "List<String>",
            "name": "splitByCharacterTypeCamelCase",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "startsWith",
            "parameters": ["(String prefix)"]
        }, {
            "type": "Boolean",
            "name": "startsWithIgnoreCase",
            "parameters": ["(String prefix)"]
        }, {
            "type": "String",
            "name": "stripHtmlTags",
            "parameters": ["(String htmlInput)"]
        }, {
            "type": "String",
            "name": "substring",
            "parameters": ["(Integer startIndex)", "(Integer startIndex, Integer endIndex)"]
        }, {
            "type": "String",
            "name": "substringAfter",
            "parameters": ["(String separator)"]
        }, {
            "type": "String",
            "name": "substringAfterLast",
            "parameters": ["(String separator)"]
        }, {
            "type": "String",
            "name": "substringBefore",
            "parameters": ["(String separator)"]
        }, {
            "type": "String",
            "name": "substringBeforeLast",
            "parameters": ["(String separator)"]
        }, {
            "type": "String",
            "name": "substringBetween",
            "parameters": ["(String tag)", "(String open, String close)"]
        }, {
            "type": "String",
            "name": "swapCase",
            "parameters": ["(String open, String close)"]
        }, {
            "type": "String",
            "name": "toLowerCase",
            "parameters": ["()", "(String locale)"]
        }, {
            "type": "String",
            "name": "toUpperCase",
            "parameters": ["()", "(String locale)"]
        }, {
            "type": "String",
            "name": "trim",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "uncapitalize",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "unescapeCsv",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "unescapeEcmaScript",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "unescapeHtml3",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "unescapeHtml4",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "unescapeJava",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "unescapeUnicode",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "unescapeXml",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "QuickActionResult": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "List<Database.Error>",
            "name": "getErrors",
            "parameters": ["()"]
        }, {
            "type": "List<Id>",
            "name": "getIds",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isCreated",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isSuccess",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "Answers": {
        "staticMethods": [{
            "type": "ID[]",
            "name": "findSimilar",
            "parameters": ["(Question q)"]
        }, {
            "type": "void",
            "name": "setBestReply",
            "parameters": ["(String questionId, String replyId)"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "Zones": {
        "staticMethods": [{
            "type": "ConnectApi.Zone",
            "name": "getZone",
            "parameters": ["(String communityId, String zoneId)"]
        }, {
            "type": "ConnectApi.ZonePage",
            "name": "getZones",
            "parameters": ["(String communityId)", "(String communityId, Integer pageParam, Integer pageSize)"]
        }, {
            "type": "ConnectApi.ZoneSearchPage",
            "name": "searchInZone",
            "parameters": ["(String communityId, String zoneId, String q, ConnectApi.ZoneSearchResultType filter)", "(String communityId, String zoneId, String q, ConnectApi.ZoneSearchResultType filter, String pageParam, Integer pageSize)"]
        }, {
            "type": "void",
            "name": "setTestSearchInZone",
            "parameters": ["(String communityId, String zoneId, String q, ConnectApi.ZoneSearchResultType filter, ConnectApi.ZoneSearchPage result)", "(String communityId, String zoneId, String q, ConnectApi.ZoneSearchResultType filter, String pageParam, Integer pageSize, ConnectApi.ZoneSearchPage result)"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "DataCategoryGroupSobjectTypePair": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String",
            "name": "getDataCategoryGroupName",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getSobject",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "setDataCategoryGroupName",
            "parameters": ["(String name)"]
        }, {
            "type": "void",
            "name": "setSobject",
            "parameters": ["(String sObjectName)"]
        }],
        "properties": [],
        "constructors": [{
            "type": "void",
            "name": "DataCategoryGroupSobjectTypePair",
            "parameters": ["()"]
        }]
    },
    "RestContext": {
        "staticMethods": [],
        "instanceMethods": [],
        "properties": [{
            "type": "RestRequest",
            "name": "request"
        }, {
            "type": "RestResponse",
            "name": "response"
        }],
        "constructors": []
    },
    "EmailFileAttachment": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "void",
            "name": "setBody",
            "parameters": ["(Blob attachment)"]
        }, {
            "type": "void",
            "name": "setContentType",
            "parameters": ["(String content_type)"]
        }, {
            "type": "void",
            "name": "setFileName",
            "parameters": ["(String file_name)"]
        }, {
            "type": "void",
            "name": "setInline",
            "parameters": ["(Boolean Content-Disposition)"]
        }],
        "properties": [],
        "constructors": [{
            "type": "void",
            "name": "EmailFileAttachment",
            "parameters": ["()"]
        }]
    },
    "UserData": {
        "staticMethods": [],
        "instanceMethods": [],
        "properties": [{
            "type": "String",
            "name": "identifier"
        }, {
            "type": "String",
            "name": "firstName"
        }, {
            "type": "String",
            "name": "lastName"
        }, {
            "type": "String",
            "name": "fullName"
        }, {
            "type": "String",
            "name": "email"
        }, {
            "type": "String",
            "name": "link"
        }, {
            "type": "String",
            "name": "username"
        }, {
            "type": "String",
            "name": "locale"
        }, {
            "type": "String",
            "name": "provider"
        }, {
            "type": "String",
            "name": "siteLoginUrl"
        }, {
            "type": "Map<String, String>",
            "name": "attributeMap"
        }],
        "constructors": [{
            "type": "void",
            "name": "UserData",
            "parameters": ["(String identifier, String firstName, String lastName, String fullName, String email, String link, String userName, String locale, String provider, String siteLoginUrl, Map<String, String> attributeMap)"]
        }]
    },
    "AuthConfiguration": {
        "staticMethods": [{
            "type": "String",
            "name": "getAuthProviderSsoUrl",
            "parameters": ["(String cUrl, String startUrl, String developerName)"]
        }, {
            "type": "String",
            "name": "getSamlSsoUrl",
            "parameters": ["(String cUrl, String startURL, String samlId)"]
        }],
        "instanceMethods": [{
            "type": "AuthConfig",
            "name": "getAuthConfig",
            "parameters": ["()"]
        }, {
            "type": "List<AuthConfigProviders>",
            "name": "getAuthConfigProviders",
            "parameters": ["()"]
        }, {
            "type": "List<AuthProvider>",
            "name": "getAuthProviders",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getBackgroundColor",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getDefaultProfileForRegistration",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getFooterText",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getLogoUrl",
            "parameters": ["()"]
        }, {
            "type": "List<SamlSsoConfig>",
            "name": "getSamlProviders",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "getSelfRegistrationEnabled",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getSelfRegistrationUrl",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getStartUrl",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "getUsernamePasswordEnabled",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": [{
            "type": "void",
            "name": "AuthConfiguration",
            "parameters": ["(String cURL, String startURL)"]
        }]
    },
    "DescribeIconResult": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String",
            "name": "getContentType",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getHeight",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getTheme",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getUrl",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getWidth",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "ReportFactWithDetails": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "LIST<Reports.SummaryValue>",
            "name": "getAggregates",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getKey",
            "parameters": ["()"]
        }, {
            "type": "LIST<Reports.ReportDetailRow>",
            "name": "getRows",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "GroupingColumn": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String",
            "name": "getName",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getLabel",
            "parameters": ["()"]
        }, {
            "type": "Reports.ColumnDataType",
            "name": "getDataType",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getGroupingLevel",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "DeletedRecord": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "Date",
            "name": "getDeletedDate",
            "parameters": ["()"]
        }, {
            "type": "Id",
            "name": "getId",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "DescribeColorResult": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String",
            "name": "getColor",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getContext",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getTheme",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "Id": {
        "staticMethods": [{
            "type": "ID",
            "name": "valueOf",
            "parameters": ["(String toID)"]
        }],
        "instanceMethods": [{
            "type": "void",
            "name": "addError",
            "parameters": ["(String errorMsg)", "(String errorMsg, Boolean escape)", "(Exception exceptionError)", "(Exception exceptionError, Boolean escape)"]
        }, {
            "type": "Schema.SObjectType",
            "name": "getSObjectType",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "InboundEmail": {
        "staticMethods": [],
        "instanceMethods": [],
        "properties": [{
            "type": "InboundEmail.BinaryAttachment[]",
            "name": "binaryAttachments"
        }, {
            "type": "String[]",
            "name": "ccAddresses"
        }, {
            "type": "String",
            "name": "fromAddress"
        }, {
            "type": "String",
            "name": "fromName"
        }, {
            "type": "InboundEmail.Header[]",
            "name": "headers"
        }, {
            "type": "String",
            "name": "htmlBody"
        }, {
            "type": "Boolean",
            "name": "htmlBodyIsTruncated"
        }, {
            "type": "String",
            "name": "inReplyTo"
        }, {
            "type": "String",
            "name": "messageId"
        }, {
            "type": "String",
            "name": "plainTextBody"
        }, {
            "type": "Boolean",
            "name": "plainTextBodyIsTruncated"
        }, {
            "type": "String[]",
            "name": "references"
        }, {
            "type": "String",
            "name": "replyTo"
        }, {
            "type": "String",
            "name": "subject"
        }, {
            "type": "InboundEmail.TextAttachment[]",
            "name": "textAttachments"
        }, {
            "type": "String[]",
            "name": "toAddresses"
        }],
        "constructors": [{
            "type": "void",
            "name": "InboundEmail",
            "parameters": ["()"]
        }]
    },
    "FieldSetMember": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "Boolean",
            "name": "getDBRequired",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getFieldPath",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getLabel",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "getRequired",
            "parameters": ["()"]
        }, {
            "type": "Schema.DisplayType",
            "name": "getType",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "sObject": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "void",
            "name": "addError",
            "parameters": ["(String errorMsg)", "(String errorMsg, Boolean escape)", "(Exception exceptionError)", "(Exception exceptionError, Boolean escape)", "(String errorMsg)", "(String errorMsg, Boolean escape)"]
        }, {
            "type": "void",
            "name": "clear",
            "parameters": ["()"]
        }, {
            "type": "sObject",
            "name": "clone",
            "parameters": ["(Boolean opt_preserve_id, Boolean opt_IsDeepClone, Boolean opt_preserve_readonly_timestamps, Boolean opt_preserve_autonumber)"]
        }, {
            "type": "Object",
            "name": "get",
            "parameters": ["(String fieldName)", "(Schema.sObjectField field)"]
        }, {
            "type": "Database.DMLOptions",
            "name": "getOptions",
            "parameters": ["()"]
        }, {
            "type": "sObject",
            "name": "getSObject",
            "parameters": ["(String fieldName)", "(Schema.SObjectField fieldName)"]
        }, {
            "type": "sObject[]",
            "name": "getSObjects",
            "parameters": ["(String fieldName)", "(Schema.SObjectType fieldName)"]
        }, {
            "type": "Schema.SObjectType",
            "name": "getSObjectType",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getQuickActionName",
            "parameters": ["()"]
        }, {
            "type": "Object",
            "name": "put",
            "parameters": ["(String fieldName, Object value)", "(Schema.SObjectField fieldName, Object value)"]
        }, {
            "type": "sObject",
            "name": "putSObject",
            "parameters": ["(String fieldName, sObject value)", "(Schema.sObjectType fieldName, sObject value)"]
        }, {
            "type": "void",
            "name": "setOptions",
            "parameters": ["(database.DMLOptions DMLOptions)"]
        }],
        "properties": [],
        "constructors": []
    },
    "ApexPages": {
        "instanceMethods": [],
        "staticMethods": [{
            "type": "void",
            "name": "addMessage",
            "parameters": ["(sObject ApexPages.Message)"]
        }, {
            "type": "void",
            "name": "addMessages",
            "parameters": ["(Exception ex)"]
        }, {
            "type": "PageReference",
            "name": "currentPage",
            "parameters": ["()"]
        }, {
            "type": "ApexPages.Message[]",
            "name": "getMessages",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "hasMessages",
            "parameters": ["()", "(ApexPages.Severity sev)"]
        }],
        "properties": [],
        "constructors": []
    },
    "QuickAction": {
        "staticMethods": [{
            "type": "List<QuickAction.DescribeAvailableQuickActionResult>",
            "name": "describeAvailableQuickActions",
            "parameters": ["(String parentType)", "(List<String> sObjectNames)"]
        }, {
            "type": "QuickAction.QuickActionResult",
            "name": "performQuickAction",
            "parameters": ["(QuickAction.QuickActionRequest performQuickAction)", "(QuickAction.QuickActionRequest performQuickAction, Boolean allOrNothing)"]
        }, {
            "type": "List<QuickAction.QuickActionResult>",
            "name": "performQuickActions",
            "parameters": ["(List<QuickAction.QuickActionRequest> performQuickActions)", "(List<QuickAction.QuickActionRequest> performQuickActions, Boolean allOrNothing)"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "SessionManagement": {
        "staticMethods": [{
            "type": "Map<String, String>",
            "name": "getCurrentSession",
            "parameters": ["()"]
        }, {
            "type": "Map<String, String>",
            "name": "getQrCode",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "inOrgNetworkRange",
            "parameters": ["(String ipAddress)"]
        }, {
            "type": "Boolean",
            "name": "isIpAllowedForProfile",
            "parameters": ["(String profileId, String ipAddress)"]
        }, {
            "type": "void",
            "name": "setSessionLevel",
            "parameters": ["(Auth.SessionLevel level)"]
        }, {
            "type": "Boolean",
            "name": "validateTotpTokenForKey",
            "parameters": ["(String sharedKey, String totpCode)"]
        }, {
            "type": "Boolean",
            "name": "validateTotpTokenForUser",
            "parameters": ["(String totpCode)"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "ReportMetadata": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "LIST<String>",
            "name": "getAggregates",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getCurrencyCode",
            "parameters": ["()"]
        }, {
            "type": "LIST<String>",
            "name": "getDetailColumns",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getDeveloperName",
            "parameters": ["()"]
        }, {
            "type": "LIST<Reports.GroupingInfo>",
            "name": "getGroupingsAcross",
            "parameters": ["()"]
        }, {
            "type": "LIST<Reports.GroupingInfo>",
            "name": "getGroupingsDown",
            "parameters": ["()"]
        }, {
            "type": "LIST<String>",
            "name": "getHistoricalSnapshotDates",
            "parameters": ["()"]
        }, {
            "type": "Id",
            "name": "getId",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getName",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getReportBooleanFilter",
            "parameters": ["()"]
        }, {
            "type": "LIST<Reports.ReportFilter>",
            "name": "getReportFilters",
            "parameters": ["()"]
        }, {
            "type": "Reports.ReportFormat",
            "name": "getReportFormat",
            "parameters": ["()"]
        }, {
            "type": "Reports.ReportType",
            "name": "getReportType",
            "parameters": ["()"]
        }, {
            "type": "void",
            "name": "setHistoricalSnapshotDates",
            "parameters": ["(LIST<String> historicalSnapshot)"]
        }, {
            "type": "void",
            "name": "setReportBooleanFilter",
            "parameters": ["(String reportBooleanFilter)"]
        }, {
            "type": "void",
            "name": "setReportFilters",
            "parameters": ["(LIST<Reports.ReportFilter> reportFilters)"]
        }],
        "properties": [],
        "constructors": []
    },
    "DescribeTabResult": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "List<Schema.DescribeColorResult>",
            "name": "getColors",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getIconUrl",
            "parameters": ["()"]
        }, {
            "type": "List<Schema.DescribeIconResult>",
            "name": "getIcons",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getLabel",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getMiniIconUrl",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getSobjectName",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getUrl",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isCustom",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "GetUpdatedResult": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "List<Id>",
            "name": "getIds",
            "parameters": ["()"]
        }, {
            "type": "Date",
            "name": "getLatestDateCovered",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "DescribeTabSetResult": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String",
            "name": "getLabel",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getLogoUrl",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getNamespace",
            "parameters": ["()"]
        }, {
            "type": "List<Schema.DescribeTabResult>",
            "name": "getTabs",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isSelected",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "Crypto": {
        "staticMethods": [{
            "type": "Blob",
            "name": "decrypt",
            "parameters": ["(String algorithmName, Blob privateKey, Blob initializationVector, Blob cipherText)"]
        }, {
            "type": "Blob",
            "name": "decryptWithManagedIV",
            "parameters": ["(String algorithmName, Blob privateKey, Blob IVAndCipherText)"]
        }, {
            "type": "Blob",
            "name": "encrypt",
            "parameters": ["(String algorithmName, Blob privateKey, Blob initializationVector, Blob clearText)"]
        }, {
            "type": "Blob",
            "name": "encryptWithManagedIV",
            "parameters": ["(String algorithmName, Blob privateKey, Blob clearText)"]
        }, {
            "type": "Blob",
            "name": "generateAesKey",
            "parameters": ["(Integer size)"]
        }, {
            "type": "Blob",
            "name": "generateDigest",
            "parameters": ["(String algorithmName, Blob input)"]
        }, {
            "type": "Blob",
            "name": "generateMac",
            "parameters": ["(String algorithmName, Blob input, Blob privateKey)"]
        }, {
            "type": "Integer",
            "name": "getRandomInteger",
            "parameters": ["()"]
        }, {
            "type": "Long",
            "name": "getRandomLong",
            "parameters": ["()"]
        }, {
            "type": "Blob",
            "name": "sign",
            "parameters": ["(String algorithmName, Blob input, Blob privateKey)"]
        }, {
            "type": "Blob",
            "name": "signWithCertificate",
            "parameters": ["(String algorithmName, Blob input, String certDevName)"]
        }],
        "instanceMethods": [{
            "type": "void",
            "name": "signXML",
            "parameters": ["(String algorithmName, Dom.XmlNode node, String idAttributeName, String certDevName)"]
        }],
        "properties": [],
        "constructors": []
    },
    "JSONGenerator": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "void",
            "name": "close",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getAsString",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isClosed",
            "parameters": ["()"]
        }, {
            "type": "void",
            "name": "writeBlob",
            "parameters": ["(Blob blobValue)"]
        }, {
            "type": "void",
            "name": "writeBlobField",
            "parameters": ["(String fieldName, Blob blobValue)"]
        }, {
            "type": "void",
            "name": "writeBoolean",
            "parameters": ["(Boolean blobValue)"]
        }, {
            "type": "void",
            "name": "writeBooleanField",
            "parameters": ["(String fieldName, Boolean booleanValue)"]
        }, {
            "type": "void",
            "name": "writeDate",
            "parameters": ["(Date dateValue)"]
        }, {
            "type": "void",
            "name": "writeDateField",
            "parameters": ["(String fieldName, Date dateValue)"]
        }, {
            "type": "void",
            "name": "writeDateTime",
            "parameters": ["(Datetime datetimeValue)"]
        }, {
            "type": "void",
            "name": "writeDateTimeField",
            "parameters": ["(String fieldName, Datetime datetimeValue)"]
        }, {
            "type": "void",
            "name": "writeEndArray",
            "parameters": ["()"]
        }, {
            "type": "void",
            "name": "writeEndObject",
            "parameters": ["()"]
        }, {
            "type": "void",
            "name": "writeFieldName",
            "parameters": ["(String fieldName)"]
        }, {
            "type": "void",
            "name": "writeId",
            "parameters": ["(ID identifier)"]
        }, {
            "type": "void",
            "name": "writeIdField",
            "parameters": ["(String fieldName, Id identifier)"]
        }, {
            "type": "void",
            "name": "writeNull",
            "parameters": ["()"]
        }, {
            "type": "void",
            "name": "writeNullField",
            "parameters": ["(String fieldName)"]
        }, {
            "type": "void",
            "name": "writeNumber",
            "parameters": ["(Decimal number)", "(Double number)", "(Integer number)", "(Long number)"]
        }, {
            "type": "void",
            "name": "writeNumberField",
            "parameters": ["(String fieldName, Decimal number)", "(String fieldName, Double number)", "(String fieldName, Integer number)", "(String fieldName, Long number)"]
        }, {
            "type": "void",
            "name": "writeObject",
            "parameters": ["(Object anyType)"]
        }, {
            "type": "void",
            "name": "writeObjectField",
            "parameters": ["(String fieldName, Object anyType)"]
        }, {
            "type": "void",
            "name": "writeStartArray",
            "parameters": ["()"]
        }, {
            "type": "void",
            "name": "writeStartObject",
            "parameters": ["()"]
        }, {
            "type": "void",
            "name": "writeString",
            "parameters": ["(String stringValue)"]
        }, {
            "type": "void",
            "name": "writeStringField",
            "parameters": ["(String fieldName, String stringValue)"]
        }, {
            "type": "void",
            "name": "writeTime",
            "parameters": ["(Time timeValue)"]
        }, {
            "type": "void",
            "name": "writeTimeField",
            "parameters": ["(String fieldName, Time timeValue)"]
        }],
        "properties": [],
        "constructors": []
    },
    "Organization": {
        "staticMethods": [{
            "type": "ConnectApi.OrganizationSettings",
            "name": "getSettings",
            "parameters": ["()"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "ReportFact": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "LIST<Reports.SummaryValue>",
            "name": "getAggregates",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getKey",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "Announcements": {
        "staticMethods": [{
            "type": "void",
            "name": "deleteAnnouncement",
            "parameters": ["(String communityId, String announcementId)"]
        }, {
            "type": "ConnectApi.Announcement",
            "name": "getAnnouncement",
            "parameters": ["(String communityId, String announcementId)"]
        }, {
            "type": "ConnectApi.Announcement",
            "name": "udpateAnnouncement",
            "parameters": ["(String communityId, String announcementId, Datetime expirationDate)"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "Http": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "HttpResponse",
            "name": "send",
            "parameters": ["(HttpRequest request)"]
        }, {
            "type": "String",
            "name": "toString",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "XmlNode": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "Dom.XmlNode",
            "name": "addChildElement",
            "parameters": ["(String name, String namespace, String prefix)"]
        }, {
            "type": "Dom.XmlNode",
            "name": "addCommentNode",
            "parameters": ["(String text)"]
        }, {
            "type": "Dom.XmlNode",
            "name": "addTextNode",
            "parameters": ["(String text)"]
        }, {
            "type": "String",
            "name": "getAttribute",
            "parameters": ["(String key, String keyNamespace)"]
        }, {
            "type": "Integer",
            "name": "getAttributeCount",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getAttributeKeyAt",
            "parameters": ["(Integer index)"]
        }, {
            "type": "String",
            "name": "getAttributeKeyNsAt",
            "parameters": ["(Integer index)"]
        }, {
            "type": "String",
            "name": "getAttributeValue",
            "parameters": ["(String key, String keyNamespace)"]
        }, {
            "type": "String",
            "name": "getAttributeValueNs",
            "parameters": ["(String key, String keyNamespace)"]
        }, {
            "type": "Dom.XmlNode",
            "name": "getChildElement",
            "parameters": ["(String name, String namespace)"]
        }, {
            "type": "Dom.XmlNode[]",
            "name": "getChildElements",
            "parameters": ["()"]
        }, {
            "type": "Dom.XmlNode[]",
            "name": "getChildren",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getName",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getNamespace",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getNamespaceFor",
            "parameters": ["(String prefix)"]
        }, {
            "type": "Dom.XmlNodeType",
            "name": "getNodeType",
            "parameters": ["()"]
        }, {
            "type": "Dom.XmlNode",
            "name": "getParent",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getPrefixFor",
            "parameters": ["(String namespace)"]
        }, {
            "type": "String",
            "name": "getText",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "removeAttribute",
            "parameters": ["(String key, String keyNamespace)"]
        }, {
            "type": "Boolean",
            "name": "removeChild",
            "parameters": ["(Dom.XmlNode childNode)"]
        }, {
            "type": "void",
            "name": "setAttribute",
            "parameters": ["(String key, String value)"]
        }, {
            "type": "void",
            "name": "setAttributeNs",
            "parameters": ["(String key, String value, String keyNamespace, String valueNamespace)"]
        }, {
            "type": "void",
            "name": "setNamespace",
            "parameters": ["(String prefix, String namespace)"]
        }],
        "properties": [],
        "constructors": []
    },
    "EncodingUtil": {
        "staticMethods": [{
            "type": "Blob",
            "name": "base64Decode",
            "parameters": ["(String inputString)"]
        }, {
            "type": "String",
            "name": "base64Encode",
            "parameters": ["(Blob inputBlob)"]
        }, {
            "type": "Blob",
            "name": "convertToHex",
            "parameters": ["(String inputString)", "(Blob inputString)"]
        }, {
            "type": "String",
            "name": "urlDecode",
            "parameters": ["(String inputString, String encodingScheme)"]
        }, {
            "type": "String",
            "name": "urlEncode",
            "parameters": ["(String inputString, String encodingScheme)"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "QueryLocator": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String",
            "name": "getQuery",
            "parameters": ["()"]
        }, {
            "type": "Database.QueryLocatorIterator",
            "name": "iterator",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "DescribeFieldResult": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "Integer",
            "name": "getByteLength",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getCalculatedFormula",
            "parameters": ["()"]
        }, {
            "type": "Schema.sObjectField",
            "name": "getController",
            "parameters": ["()"]
        }, {
            "type": "Object",
            "name": "getDefaultValue",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getDefaultValueFormula",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getDigits",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getInlineHelpText",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getLabel",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getLength",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getLocalName",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getName",
            "parameters": ["()"]
        }, {
            "type": "List<Schema.PicklistEntry>",
            "name": "getPicklistValues",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getPrecision",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getReferenceTargetField",
            "parameters": ["()"]
        }, {
            "type": "List<Schema.sObjectType>",
            "name": "getReferenceTo",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getRelationshipName",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getRelationshipOrder",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getScale",
            "parameters": ["()"]
        }, {
            "type": "Schema.SOAPType",
            "name": "getSOAPType",
            "parameters": ["()"]
        }, {
            "type": "Schema.sObjectField",
            "name": "getSObjectField",
            "parameters": ["()"]
        }, {
            "type": "Schema.DisplayType",
            "name": "getType",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isAccessible",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isAutoNumber",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isCalculated",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isCascadeDelete",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isCaseSensitive",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isCreateable",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isCustom",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isDefaultedOnCreate",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isDependentPicklist",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isDeprecatedAndHidden",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isExternalID",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isFilterable",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isGroupable",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isHtmlFormatted",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isIdLookup",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isNameField",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isNamePointing",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isNillable",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isPermissionable",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isRestrictedDelete",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isRestrictedPicklist",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isSortable",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isUnique",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isUpdateable",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isWriteRequiresMasterRead",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "Approval": {
        "staticMethods": [{
            "type": "Approval.ProcessResult",
            "name": "process",
            "parameters": ["(Approval.ProcessRequest processRequest)", "(Approval.ProcessRequest processRequests, Boolean opt_allOrNone)"]
        }, {
            "type": "Approval.ProcessResult[]",
            "name": "process",
            "parameters": ["(Approval.ProcessRequest[] processRequests)", "(Approval.ProcessRequest[] processRequests, Boolean opt_allOrNone)"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "InboundEnvelope": {
        "staticMethods": [],
        "instanceMethods": [],
        "properties": [{
            "type": "String",
            "name": "fromAddress"
        }, {
            "type": "String",
            "name": "toAddress"
        }],
        "constructors": []
    },
    "EmptyRecycleBinResult": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "Database.Errors[]",
            "name": "getErrors",
            "parameters": ["()"]
        }, {
            "type": "ID",
            "name": "getId",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isSuccess",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "Error": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String[]",
            "name": "getFields",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getMessage",
            "parameters": ["()"]
        }, {
            "type": "StatusCode",
            "name": "getStatusCode",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "GetDeletedResult": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "List<Database.DeletedRecord>",
            "name": "getDeletedRecords",
            "parameters": ["()"]
        }, {
            "type": "Date",
            "name": "getEarliestDateAvailable",
            "parameters": ["()"]
        }, {
            "type": "Date",
            "name": "getLatestDateCovered",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "AuthToken": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String",
            "name": "getAccessToken",
            "parameters": ["(String authProviderId, String providerName)"]
        }, {
            "type": "Map<String, String>",
            "name": "getAccessTokenMap",
            "parameters": ["(String authProviderId, String providerName)"]
        }, {
            "type": "Map<String, String>",
            "name": "refreshAccessToken",
            "parameters": ["(String authProviderId, String providerName, String oldAccessToken)"]
        }],
        "properties": [],
        "constructors": []
    },
    "CommunitiesUtil": {
        "staticMethods": [{
            "type": "String",
            "name": "getLogoutUrl",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getUserDisplayName",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isGuestUser",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isInternalUser",
            "parameters": ["()"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "LeadConvertResult": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "ID",
            "name": "getAccountId",
            "parameters": ["()"]
        }, {
            "type": "ID",
            "name": "getContactId",
            "parameters": ["()"]
        }, {
            "type": "Database.Error[]",
            "name": "getErrors",
            "parameters": ["()"]
        }, {
            "type": "ID",
            "name": "getLeadId",
            "parameters": ["()"]
        }, {
            "type": "ID",
            "name": "getOpportunityId",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isSuccess",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "MergeResult": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "List<Database.Error>",
            "name": "getErrors",
            "parameters": ["()"]
        }, {
            "type": "Id",
            "name": "getId",
            "parameters": ["()"]
        }, {
            "type": "List<String>",
            "name": "getMergedRecordIds",
            "parameters": ["()"]
        }, {
            "type": "List<String>",
            "name": "getUpdatedRelatedIds",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isSuccess",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "Mentions": {
        "staticMethods": [{
            "type": "ConnectApi.MentionCompletionPage",
            "name": "getMentionCompletions ",
            "parameters": ["(String communityId, String q, String contextId)"]
        }, {
            "type": "ConnectApi.Mentions",
            "name": "getMentionCompletions ",
            "parameters": ["(String communityId, String q, String contextId, ConnectApi.MentionCompletionType type, Integer pageParam, Integer pageSize)"]
        }, {
            "type": "ConnectApi.Mentions",
            "name": "getMentionValidations",
            "parameters": ["(String communityId, String parentId, List<String> recordIds, ConnectApi.FeedItemVisibilityType visibility)"]
        }, {
            "type": "void",
            "name": "setTestGetMentionCompletions ",
            "parameters": ["(String communityId, String q, String contextId, ConnectApi.MentionCompletionPage result)", "(String communityId, String q, String contextId, ConnectApi.MentionCompletionType type, Integer pageParam, Integer pageSize, ConnectApi.MentionCompletionPage result)"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "QueryLocatorIterator": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "Boolean",
            "name": "hasNext",
            "parameters": ["()"]
        }, {
            "type": "sObject",
            "name": "next",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "SaveResult": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "Database.Error[]",
            "name": "getErrors",
            "parameters": ["()"]
        }, {
            "type": "ID",
            "name": "getId",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isSuccess",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "UndeleteResult": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "Database.Error[]",
            "name": "getErrors",
            "parameters": ["()"]
        }, {
            "type": "ID",
            "name": "getId",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isSuccess",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "UpsertResult": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "Database.Error[]",
            "name": "getErrors",
            "parameters": ["()"]
        }, {
            "type": "ID",
            "name": "getId",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isCreated",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isSuccess",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "ReportTypeColumn": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "Reports.ColumnDataType",
            "name": "getDataType",
            "parameters": ["()"]
        }, {
            "type": "LIST<Reports.FilterValue>",
            "name": "getFilterValues",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "getFilterable",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getLabel",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getName",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "Search": {
        "staticMethods": [{
            "type": "sObject[sObject[]]",
            "name": "query",
            "parameters": ["(String query)"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "Schema": {
        "staticMethods": [{
            "type": "Map<String, Schema.SObjectType>",
            "name": "getGlobalDescribe",
            "parameters": ["()"]
        }, {
            "type": "List<Schema.DescribeDataCategoryGroupResult>",
            "name": "describeDataCategoryGroups",
            "parameters": ["(String List<String>)"]
        }, {
            "type": "List<Schema.DescribeSObjectResult>",
            "name": "describeSObjects",
            "parameters": ["(List<String> types)"]
        }, {
            "type": "List<Schema.DescribeTabSetResult>",
            "name": "describeTabs",
            "parameters": ["()"]
        }, {
            "type": "List<Schema.DescribeDataCategoryGroupStructureResult>",
            "name": "describeDataCategoryGroupStructures",
            "parameters": ["(List<Schema.DataCategoryGroupSobjectTypePair> pairs)"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "Records": {
        "staticMethods": [{
            "type": "ConnectApi.Motif",
            "name": "getMotif",
            "parameters": ["(String communityId, String idOrPrefix)"]
        }, {
            "type": "ConnectApi.BatchResult[]",
            "name": "getMotifBatch",
            "parameters": ["(String communityId, List<String> idOrPrefixList)"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "Topics": {
        "staticMethods": [{
            "type": "ConnectApi.Topic",
            "name": "assignTopic",
            "parameters": ["(String communityId, String recordId, String topicId)"]
        }, {
            "type": "ConnectApi.Topic",
            "name": "assignTopicByName",
            "parameters": ["(String communityId, String recordId, String topicName)"]
        }, {
            "type": "void",
            "name": "deleteTopic",
            "parameters": ["(String communityId, String topicId)"]
        }, {
            "type": "ConnectApi.ChatterGroupSummaryPage",
            "name": "getGroupsRecentlyTalkingAboutTopic",
            "parameters": ["(String communityId, String topicId)"]
        }, {
            "type": "ConnectApi.TopicPage",
            "name": "getRecentlyTalkingAboutTopicsForGroup",
            "parameters": ["(String communityId, String groupId)"]
        }, {
            "type": "ConnectApi.TopicPage",
            "name": "getRecentlyTalkingAboutTopicsForUser",
            "parameters": ["(String communityId, String userId)"]
        }, {
            "type": "ConnectApi.TopicPage",
            "name": "getRelatedTopics",
            "parameters": ["(String communityId, String topicId)"]
        }, {
            "type": "ConnectApi.Topic",
            "name": "getTopic",
            "parameters": ["(String communityId, String topicId)"]
        }, {
            "type": "ConnectApi.TopicPage",
            "name": "getTopics",
            "parameters": ["(String communityId, String recordId)", "(String communityId)", "(String communityId, ConnectApi.TopicSort sortParam)", "(String communityId, Integer pageParam, Integer pageSize)", "(String communityId, Integer pageParam, Integer pageSize, ConnectApi.TopicSort sortParam)", "(String communityId, String q, ConnectApi.TopicSort sortParam)", "(String communityId, String q, Integer pageParam, Integer pageSize)", "(String communityId, String q, Integer pageParam, Integer pageSize, ConnectApi.TopicSort sortParam)"]
        }, {
            "type": "ConnectApi.TopicSuggestionPage",
            "name": "getTopicSuggestions",
            "parameters": ["(String communityId, String recordId, Integer maxResults)", "(String communityId, String recordId)"]
        }, {
            "type": "ConnectApi.TopicSuggestionPage",
            "name": "getTopicSuggestionsForText",
            "parameters": ["(String communityId, String text, Integer maxResults)", "(String communityId, String text)"]
        }, {
            "type": "ConnectApi.TopicPage",
            "name": "getTrendingTopics",
            "parameters": ["(String communityId)", "(String communityId, Integer maxResults)"]
        }, {
            "type": "void",
            "name": "unassignTopic",
            "parameters": ["(String communityId, String recordId, String topicId)"]
        }, {
            "type": "ConnectApi.Topic",
            "name": "updateTopic",
            "parameters": ["(String communityId, String topicId, ConnectApi.TopicInput topic)"]
        }, {
            "type": "void",
            "name": "setTestGetGroupsRecentlyTalkingAboutTopic",
            "parameters": ["(String communityId, String topicId, ConnectApi.ChatterGroupSummaryPage result)"]
        }, {
            "type": "void",
            "name": "setTestGetRecentlyTalkingAboutTopicsForGroup",
            "parameters": ["(String communityId, String groupId, ConnectApi.​TopicPage result)"]
        }, {
            "type": "void",
            "name": "setTestGetRecentlyTalkingAboutTopicsForUser",
            "parameters": ["(String communityId, String userId, ConnectApi.TopicPage result)"]
        }, {
            "type": "void",
            "name": "setTestGetRelatedTopics",
            "parameters": ["(String communityId, String topicId, ConnectApi.TopicPage result)"]
        }, {
            "type": "void",
            "name": "setTestGetTopicSuggestions",
            "parameters": ["(String communityId, String recordId, Integer maxResults, ConnectApi.TopicSuggestionPage result)", "(String communityId, String recordId, ConnectApi.​TopicSuggestionPage result)"]
        }, {
            "type": "void",
            "name": "setTestGetTopicSuggestionsForText",
            "parameters": ["(String communityId, String text, Integer maxResults, ConnectApi.TopicSuggestionPage result)", "(String communityId, String text, ConnectApi.TopicSuggestionPage result)"]
        }, {
            "type": "void",
            "name": "setTestGetTrendingTopics",
            "parameters": ["(String communityId, ConnectApi.TopicPage result)", "(String communityId, Integer maxResults, ConnectApi.TopicPage result)"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "BusinessHours": {
        "staticMethods": [{
            "type": "Datetime",
            "name": "add",
            "parameters": ["(String businessHoursId, Datetime startDate, Long interval)"]
        }, {
            "type": "Datetime",
            "name": "addGmt",
            "parameters": ["(String businessHoursId, Datetime startDate, Long interval)"]
        }, {
            "type": "Long",
            "name": "diff",
            "parameters": ["(String businessHoursId, Datetime startDate, Datetime endDate)"]
        }, {
            "type": "Boolean",
            "name": "isWithin",
            "parameters": ["(String businessHoursId, Datetime targetDate)"]
        }, {
            "type": "Datetime",
            "name": "nextStartDate",
            "parameters": ["(String businessHoursId, Datetime targetDate)"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "ResetPasswordResult": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String",
            "name": "getPassword",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "Time": {
        "staticMethods": [{
            "type": "Time",
            "name": "newInstance",
            "parameters": ["(Integer hour, Integer minutes, Integer seconds, Integer milliseconds)"]
        }],
        "instanceMethods": [{
            "type": "Time",
            "name": "addHours",
            "parameters": ["(Integer addlHours)"]
        }, {
            "type": "Time",
            "name": "addMilliseconds",
            "parameters": ["(Integer addlMilliseconds)"]
        }, {
            "type": "Time",
            "name": "addMinutes",
            "parameters": ["(Integer addlMinutes)"]
        }, {
            "type": "Time",
            "name": "addSeconds",
            "parameters": ["(Integer addlSeconds)"]
        }, {
            "type": "Integer",
            "name": "hour",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "millisecond",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "minute",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "second",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "DetailColumn": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String",
            "name": "getName",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getLabel",
            "parameters": ["()"]
        }, {
            "type": "Reports.ColumnDataType",
            "name": "getDataType",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "Pattern": {
        "staticMethods": [{
            "type": "Pattern",
            "name": "compile",
            "parameters": ["(String regExp)"]
        }, {
            "type": "Boolean",
            "name": "matches",
            "parameters": ["(String regExp, String s)"]
        }, {
            "type": "String",
            "name": "quote",
            "parameters": ["(String s)"]
        }],
        "instanceMethods": [{
            "type": "Matcher",
            "name": "matcher",
            "parameters": ["(String regExp)"]
        }, {
            "type": "String",
            "name": "pattern",
            "parameters": ["()"]
        }, {
            "type": "String[]",
            "name": "split",
            "parameters": ["(String s)", "(String regExp, Integer limit)"]
        }],
        "properties": [],
        "constructors": []
    },
    "InboundEmailResult": {
        "staticMethods": [],
        "instanceMethods": [],
        "properties": [{
            "type": "String",
            "name": "message"
        }, {
            "type": "Boolean",
            "name": "success"
        }],
        "constructors": []
    },
    "Messaging": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "void",
            "name": "reserveMassEmailCapacity",
            "parameters": ["(Integer amountReserved)"]
        }, {
            "type": "void",
            "name": "reserveSingleEmailCapacity",
            "parameters": ["(Integer amountReserved)"]
        }, {
            "type": "Messaging.SendEmailResult[]",
            "name": "sendEmail",
            "parameters": ["(Messaging.Email[] emails, Boolean allOrNothing)"]
        }, {
            "type": "Messaging.SendEmailResult[]",
            "name": "sendEmailMessage",
            "parameters": ["(List <ID> emailMessageIds, Boolean allOrNothing)"]
        }],
        "properties": [],
        "constructors": []
    },
    "DataCategory": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "Schema.DataCategory",
            "name": "getChildCategories",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getLabel",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getName",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "Math": {
        "staticMethods": [{
            "type": "Decimal",
            "name": "abs",
            "parameters": ["(Decimal d)", "(Double d)", "(Integer i)", "(Long l)"]
        }, {
            "type": "Decimal",
            "name": "acos",
            "parameters": ["(Decimal d)", "(Double d)"]
        }, {
            "type": "Decimal",
            "name": "asin",
            "parameters": ["(Decimal d)", "(Double d)"]
        }, {
            "type": "Decimal",
            "name": "atan",
            "parameters": ["(Decimal d)", "(Double d)"]
        }, {
            "type": "Decimal",
            "name": "atan2",
            "parameters": ["(Decimal x, Decimal y)", "(Double x, Double y)"]
        }, {
            "type": "Decimal",
            "name": "cbrt",
            "parameters": ["(Decimal d)", "(Double d)"]
        }, {
            "type": "Decimal",
            "name": "ceil",
            "parameters": ["(Decimal d)", "(Double d)"]
        }, {
            "type": "Decimal",
            "name": "cos",
            "parameters": ["(Decimal d)", "(Double d)"]
        }, {
            "type": "Decimal",
            "name": "cosh",
            "parameters": ["(Decimal d)", "(Double d)"]
        }, {
            "type": "Decimal",
            "name": "exp",
            "parameters": ["(Decimal d)", "(Double d)"]
        }, {
            "type": "Decimal",
            "name": "floor",
            "parameters": ["(Decimal d)", "(Double d)"]
        }, {
            "type": "Decimal",
            "name": "log",
            "parameters": ["(Decimal d)", "(Double d)"]
        }, {
            "type": "Decimal",
            "name": "log10",
            "parameters": ["(Decimal d)", "(Double d)"]
        }, {
            "type": "Decimal",
            "name": "max",
            "parameters": ["(Decimal d1, Decimal d2)", "(Double d1, Double d2)", "(Integer i1, Integer i2)", "(Long l1, Long l2)"]
        }, {
            "type": "Decimal",
            "name": "min",
            "parameters": ["(Decimal d1, Decimal d2)", "(Double d1, Double d2)", "(Integer i1, Integer i2)", "(Long l1, Long l2)"]
        }, {
            "type": "Integer",
            "name": "mod",
            "parameters": ["(Integer i1, Integer i2)", "(Long L1, Long L2)"]
        }, {
            "type": "Double",
            "name": "pow",
            "parameters": ["(Double d, Double exp)"]
        }, {
            "type": "Double",
            "name": "random",
            "parameters": ["()"]
        }, {
            "type": "Decimal",
            "name": "rint",
            "parameters": ["(Decimal d)", "(Double d)"]
        }, {
            "type": "Integer",
            "name": "round",
            "parameters": ["(Double d)", "(Decimal d)"]
        }, {
            "type": "Long",
            "name": "roundToLong",
            "parameters": ["(Decimal d)", "(Double d)"]
        }, {
            "type": "Decimal",
            "name": "signum",
            "parameters": ["(Decimal d)", "(Double d)"]
        }, {
            "type": "Decimal",
            "name": "sin",
            "parameters": ["(Decimal d)", "(Double d)"]
        }, {
            "type": "Decimal",
            "name": "sinh",
            "parameters": ["(Decimal d)", "(Double d)"]
        }, {
            "type": "Decimal",
            "name": "sqrt",
            "parameters": ["(Decimal d)", "(Double d)"]
        }, {
            "type": "Decimal",
            "name": "tan",
            "parameters": ["(Decimal d)", "(Double d)"]
        }, {
            "type": "Decimal",
            "name": "tanh",
            "parameters": ["(Decimal d)", "(Double d)"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "ReportType": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String",
            "name": "getLabel",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getType",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "SObjectType": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "Schema.DescribeSObjectResult",
            "name": "getDescribe",
            "parameters": ["()"]
        }, {
            "type": "sObject",
            "name": "newSObject",
            "parameters": ["()", "(ID Id)", "(ID recordTypeId, Boolean loadDefaults)"]
        }],
        "properties": [],
        "constructors": []
    },
    "SendEmailError": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String[]",
            "name": "getFields",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getMessage",
            "parameters": ["()"]
        }, {
            "type": "System.StatusCode",
            "name": "getStatusCode",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getTargetObjectId",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "SendEmailResult": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "SendEmailError[]",
            "name": "getErrors",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isSuccess",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "Chatter": {
        "staticMethods": [{
            "type": "void",
            "name": "deleteSubscription",
            "parameters": ["(String communityId, String subscriptionId)"]
        }, {
            "type": "ConnectApi.FollowerPage",
            "name": "getFollowers",
            "parameters": ["(String communityId, String recordId)", "(String communityId, String recordId, Integer pageParam, Integer pageSize)"]
        }, {
            "type": "ConnectApi.Subscription",
            "name": "getSubscription",
            "parameters": ["(String communityId, String subscriptionId)"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "SObjectField": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "Schema.DescribeFieldResult",
            "name": "getDescribe",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "ChildRelationship": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "Schema.SObjectType",
            "name": "getChildSObject",
            "parameters": ["()"]
        }, {
            "type": "Schema.SObjectField",
            "name": "getField",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getRelationshipName",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isCascadeDelete",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isDeprecatedAndHidden",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isRestrictedDelete",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "Matcher": {
        "staticMethods": [{
            "type": "String",
            "name": "quoteReplacement",
            "parameters": ["(String inputString)"]
        }],
        "instanceMethods": [{
            "type": "Integer",
            "name": "end",
            "parameters": ["()", "(Integer groupIndex)"]
        }, {
            "type": "Boolean",
            "name": "find",
            "parameters": ["()", "(Integer group)"]
        }, {
            "type": "String",
            "name": "group",
            "parameters": ["()", "(Integer groupIndex)"]
        }, {
            "type": "Integer",
            "name": "groupCount",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "hasAnchoringBounds",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "hasTransparentBounds",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "hitEnd",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "lookingAt",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "matches",
            "parameters": ["()"]
        }, {
            "type": "Pattern",
            "name": "pattern",
            "parameters": ["()"]
        }, {
            "type": "Matcher",
            "name": "region",
            "parameters": ["(Integer start, Integer end)"]
        }, {
            "type": "Integer",
            "name": "regionEnd",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "regionStart",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "replaceAll",
            "parameters": ["(String replacementString)"]
        }, {
            "type": "String",
            "name": "replaceFirst",
            "parameters": ["(String replacementString)"]
        }, {
            "type": "Boolean",
            "name": "requireEnd",
            "parameters": ["()"]
        }, {
            "type": "Matcher",
            "name": "reset",
            "parameters": ["()"]
        }, {
            "type": "Matcher",
            "name": "reset",
            "parameters": ["(String inputSequence)"]
        }, {
            "type": "Integer",
            "name": "start",
            "parameters": ["()", "(Integer groupIndex)"]
        }, {
            "type": "Matcher",
            "name": "useAnchoringBounds",
            "parameters": ["(Boolean anchoringBounds)"]
        }, {
            "type": "Matcher",
            "name": "usePattern",
            "parameters": ["(Pattern pattern)"]
        }, {
            "type": "Matcher",
            "name": "useTransparentBounds",
            "parameters": ["(Boolean transparentBounds)"]
        }],
        "properties": [],
        "constructors": []
    },
    "RecordTypeInfo": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String",
            "name": "getName",
            "parameters": ["()"]
        }, {
            "type": "ID",
            "name": "getRecordTypeId",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isAvailable",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isDefaultRecordTypeMapping",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "UserInfo": {
        "staticMethods": [{
            "type": "String",
            "name": "getDefaultCurrency",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getFirstName",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getLanguage",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getLastName",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getLocale",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getName",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getOrganizationId",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getOrganizationName",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getProfileId",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getSessionId",
            "parameters": ["()"]
        }, {
            "type": "System.TimeZone",
            "name": "getTimeZone",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getUiTheme",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getUiThemeDisplayed",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getUserEmail",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getUserId",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getUserName",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getUserRoleId",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getUserType",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isCurrentUserLicensed",
            "parameters": ["(String namespace)"]
        }, {
            "type": "Boolean",
            "name": "isMultiCurrencyOrganization",
            "parameters": ["()"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "SummaryValue": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String",
            "name": "getLabel",
            "parameters": ["()"]
        }, {
            "type": "Object",
            "name": "getValue",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "ReportTypeColumnCategory": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "MAP<String,Reports.ReportTypeColumn>",
            "name": "getColumns",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getLabel",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "ReportTypeMetadata": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "LIST<Reports.ReportTypeColumnCategory>",
            "name": "getCategories",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "DescribeAvailableQuickActionResult": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String",
            "name": "getLabel",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getName",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getType",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "DescribeLayoutComponent": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "Integer",
            "name": "getDisplayLines",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getTabOrder",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getType",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getValue",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "DescribeLayoutItem": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String",
            "name": "getLabel",
            "parameters": ["()"]
        }, {
            "type": "List<QuickAction.DescribeLayoutComponent>",
            "name": "getLayoutComponents",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isEditable",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isPlaceholder",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isRequired",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "DescribeLayoutRow": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "List<QuickAction.DescribeLayoutItem>",
            "name": "getLayoutItems",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getNumItems",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "DescribeLayoutSection": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "Integer",
            "name": "getColumns",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getHeading",
            "parameters": ["()"]
        }, {
            "type": "List<QuickAction.DescribeLayoutRow>",
            "name": "getLayoutRows",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getRows",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isUseCollapsibleSection",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isUseHeading",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "DescribeQuickActionDefaultValue": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String",
            "name": "getDefaultValue",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getField",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "DescribeQuickActionResult": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "List<QuickAction.DescribeQuickActionDefaultValue>",
            "name": "getDefaultValues",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getHeight",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getIconName",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getIconUrl",
            "parameters": ["()"]
        }, {
            "type": "List<Schema.DescribeIconResult>",
            "name": "getIcons",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getLabel",
            "parameters": ["()"]
        }, {
            "type": "QuickAction.DescribeLayoutSection",
            "name": "getLayout",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getMiniIconUrl",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getName",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getSourceSobjectType",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getTargetParentField",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getTargetRecordTypeId",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getTargetSobjectType",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getType",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getVisualforcePageName",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "getWidth",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getCanvasApplicationName",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "ChatterUsers": {
        "staticMethods": [{
            "type": "void",
            "name": "deletePhoto",
            "parameters": ["(String communityId, String userId)"]
        }, {
            "type": "ConnectApi.Subscription",
            "name": "follow",
            "parameters": ["(String communityId, String userId, String subjectId)"]
        }, {
            "type": "ConnectApi.UserChatterSettings",
            "name": "getChatterSettings",
            "parameters": ["(String communityId, String userId)"]
        }, {
            "type": "ConnectApi.FollowerPage",
            "name": "getFollowers",
            "parameters": ["(String communityId, String userId)", "(String communityId, String userId, Integer pageParam, Integer pageSize)"]
        }, {
            "type": "ConnectApi.FollowingPage",
            "name": "getFollowings",
            "parameters": ["(String communityId, String userId)", "(String communityId, String userId, Integer pageParam)", "(String communityId, String userId, Integer pageParam, Integer pageSize)", "(String communityId, String userId, String filterType)", "(String communityId, String userId, String filterType, Integer pageParam)", "(String communityId, String userId, String filterType, Integer pageParam, Integer pageSize)"]
        }, {
            "type": "ConnectApi.UserGroupPage",
            "name": "getGroups",
            "parameters": ["(String communityId, String userId)", "(String communityId, String userId, Integer pageParam, Integer pageSize)"]
        }, {
            "type": "ConnectApi.Photo",
            "name": "getPhoto",
            "parameters": ["(String communityId, String userId)"]
        }, {
            "type": "ConnectApi.Reputation",
            "name": "getReputation",
            "parameters": ["(String communityId, String userId)"]
        }, {
            "type": "ConnectApi.UserSummary",
            "name": "getUser",
            "parameters": ["(String communityId, String userId)"]
        }, {
            "type": "ConnectApi.BatchResult[]",
            "name": "getUserBatch",
            "parameters": ["(String communityId, List<String> userIds)"]
        }, {
            "type": "ConnectApi.UserPage",
            "name": "getUsers",
            "parameters": ["(String communityId)", "(String communityId, Integer pageParam, Integer pageSize)"]
        }, {
            "type": "ConnectApi.UserGroupPage",
            "name": "searchUserGroups",
            "parameters": ["(String communityId, String userId, String q)", "(String communityId, String userId, String q, Integer pageParam, Integer pageSize)"]
        }, {
            "type": "ConnectApi.UserPage",
            "name": "searchUsers",
            "parameters": ["(String communityId, String q)", "(String communityId, String q, Integer pageParam, Integer pageSize)", "(String communityId, String q, String searchContextId, Integer pageParam, Integer pageSize)"]
        }, {
            "type": "ConnectApi.Photo",
            "name": "setPhoto",
            "parameters": ["(String communityId, String userId, String fileId, Integer versionNumber)", "(String communityId, String userId, ConnectApi.BinaryInput fileUpload)"]
        }, {
            "type": "ConnectApi.Photo",
            "name": "setPhotoWithAttributes",
            "parameters": ["(String communityId, String userId, ConnectApi.Photo photo)", "(String communityId, String userId, ConnectApi.Photo photo, ConnectApi.BinaryInput fileUpload)"]
        }, {
            "type": "ConnectApi.UserChatterSettings",
            "name": "updateChatterSettings",
            "parameters": ["(String communityId, String userId, ConnectApi.GroupEmailFrequency defaultGroupEmailFrequency)"]
        }, {
            "type": "ConnectApi.UserDetail",
            "name": "updateUser",
            "parameters": ["(String communityId, String userId, ConnectApi.UserInput userInput)"]
        }, {
            "type": "void",
            "name": "setTestSearchUsers",
            "parameters": ["(String communityId, String q, ConnectApi.UserPage result)", "(String communityId, String q, Integer pageParam, Integer pageSize, ConnectApi.UserPage result)", "(String communityId, String q, String searchContextId, Integer pageParam, Integer pageSize, ConnectApi.UserPage result)"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "Communities": {
        "staticMethods": [{
            "type": "ConnectApi.CommunityPage",
            "name": "getCommunities",
            "parameters": ["()", "(ConnectApi.CommunityStatus communityStatus)"]
        }, {
            "type": "ConnectApi.Community",
            "name": "getCommunity",
            "parameters": ["(String communityId)"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "AggregateColumn": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String",
            "name": "getName",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getLabel",
            "parameters": ["()"]
        }, {
            "type": "Reports.ColumnDataType",
            "name": "getDataType",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getAcrossGroupingContext",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getDownGroupingContext",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "ReportResults": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "Boolean",
            "name": "getAllData",
            "parameters": ["()"]
        }, {
            "type": "MAP<String,Reports.ReportFact>",
            "name": "getFactMap",
            "parameters": ["()"]
        }, {
            "type": "Reports.Dimension",
            "name": "getGroupingsAcross",
            "parameters": ["()"]
        }, {
            "type": "Reports.Dimension",
            "name": "getGroupingsDown",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "getHasDetailRows",
            "parameters": ["()"]
        }, {
            "type": "Reports.ReportExtendedMetadata",
            "name": "getReportExtendedMetadata",
            "parameters": ["()"]
        }, {
            "type": "Reports.ReportMetadata",
            "name": "getReportMetadata",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "Dimension": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "LIST<Reports.GroupingValue>",
            "name": "getGroupings",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "FilterOperator": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String",
            "name": "getLabel",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getName",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "FilterValue": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String",
            "name": "getLabel",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getName",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "PicklistEntry": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String",
            "name": "getLabel",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getValue",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isActive",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isDefaultValue",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "GroupingInfo": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String",
            "name": "getName",
            "parameters": ["()"]
        }, {
            "type": "Reports.ColumnSortOrder",
            "name": "getSortOrder",
            "parameters": ["()"]
        }, {
            "type": "Reports.DateGranularity",
            "name": "getDateGranularity",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getSortAggregate",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "GroupingValue": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "LIST<Reports.GroupingValue>",
            "name": "getGroupings",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getKey",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getLabel",
            "parameters": ["()"]
        }, {
            "type": "Object",
            "name": "getValue",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "ReportCurrency": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "Decimal",
            "name": "getAmount",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getCurrencyCode",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "ReportDataCell": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "String",
            "name": "getLabel",
            "parameters": ["()"]
        }, {
            "type": "Object",
            "name": "getValue",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "ReportDescribeResult": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "Reports.ReportExtendedMetadata",
            "name": "getReportExtendedMetadata",
            "parameters": ["()"]
        }, {
            "type": "Reports.ReportMetadata",
            "name": "getReportMetadata",
            "parameters": ["()"]
        }, {
            "type": "Reports.ReportTypeMetadata",
            "name": "getReportTypeMetadata",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "ReportDetailRow": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "LIST<Reports.ReportDataCell>",
            "name": "getDataCells",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "ReportExtendedMetadata": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "MAP<String,Reports.AggregateColumn>",
            "name": "getAggregateColumnInfo",
            "parameters": ["()"]
        }, {
            "type": "MAP<String,Reports.DetailColumn>",
            "name": "getDetailColumnInfo",
            "parameters": ["()"]
        }, {
            "type": "MAP<String,Reports.GroupingColumn>",
            "name": "getGroupingColumnInfo",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "DeleteResult": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "Database.Error[]",
            "name": "getErrors",
            "parameters": ["()"]
        }, {
            "type": "ID",
            "name": "getId",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isSuccess",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "DMLOptions": {
        "staticMethods": [],
        "instanceMethods": [],
        "properties": [{
            "type": "Boolean",
            "name": "allowFieldTruncation"
        }, {
            "type": "Database.DmlOptions.Assignmentruleheader",
            "name": "assignmentRuleHeader"
        }, {
            "type": "Database.DmlOptions.EmailHeader",
            "name": "emailHeader"
        }, {
            "type": "Database.DmlOptions.LocaleOptions",
            "name": "localeOptions"
        }, {
            "type": "Boolean",
            "name": "optAllOrNone"
        }],
        "constructors": []
    },
    "ReportInstance": {
        "staticMethods": [],
        "instanceMethods": [{
            "type": "Datetime",
            "name": "getCompletionDate",
            "parameters": ["()"]
        }, {
            "type": "Id",
            "name": "getId",
            "parameters": ["()"]
        }, {
            "type": "Id",
            "name": "getOwnerId",
            "parameters": ["()"]
        }, {
            "type": "Id",
            "name": "getReportId",
            "parameters": ["()"]
        }, {
            "type": "Reports.ReportResults",
            "name": "getReportResults",
            "parameters": ["()"]
        }, {
            "type": "Datetime",
            "name": "getRequestDate",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "getStatus",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "ReportManager": {
        "staticMethods": [{
            "type": "Reports.ReportDescribeResult",
            "name": "describeReport",
            "parameters": ["(Id reportId)"]
        }, {
            "type": "MAP<String,LIST<Reports.FilterOperator>>",
            "name": "getDatatypeFilterOperatorMap",
            "parameters": ["()"]
        }, {
            "type": "Reports.ReportInstance",
            "name": "getReportInstance",
            "parameters": ["(Id instanceId)"]
        }, {
            "type": "LIST<Reports.ReportInstance>",
            "name": "getReportInstances",
            "parameters": ["(Id reportId)"]
        }, {
            "type": "Reports.ReportInstance",
            "name": "runAsyncReport",
            "parameters": ["(Id reportId, Reports.ReportMetadata rmData, Boolean includeDetails)", "(Id reportId, Boolean includeDetails)", "(Id reportId, Reports.ReportMetadata rmData)", "(Id reportId)"]
        }, {
            "type": "Reports.ReportResults",
            "name": "runReport",
            "parameters": ["(Id reportId, Reports.ReportMetadata rmData, Boolean includeDetails)", "(Id reportId, Boolean includeDetails)", "(Id reportId, Reports.ReportMetadata rmData)", "(Id reportId)"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "Datetime": {
        "staticMethods": [{
            "type": "Datetime",
            "name": "newInstance",
            "parameters": ["(Long milliseconds)", "(Date dt, Time tm)", "(Integer year, Integer month, Integer day)", "(Integer year, Integer month, Integer day, Integer hour, Integer minute, Integer second)"]
        }, {
            "type": "Datetime",
            "name": "newInstanceGmt",
            "parameters": ["(Date dt, Time tm)", "(Integer year, Integer month, Integer date)", "(Integer year, Integer month, Integer date, Integer hour, Integer minute, Integer second)"]
        }, {
            "type": "Datetime",
            "name": "now",
            "parameters": ["()"]
        }, {
            "type": "Datetime",
            "name": "parse",
            "parameters": ["(String datetime)"]
        }, {
            "type": "Datetime",
            "name": "valueOf",
            "parameters": ["(String toDateTime)", "(Object fieldValue)"]
        }, {
            "type": "Datetime",
            "name": "valueOfGmt",
            "parameters": ["(String toDateTime)"]
        }],
        "instanceMethods": [{
            "type": "Datetime",
            "name": "addDays",
            "parameters": ["(Integer addlDays)"]
        }, {
            "type": "Datetime",
            "name": "addHours",
            "parameters": ["(Integer addlHours)"]
        }, {
            "type": "Datetime",
            "name": "addMinutes",
            "parameters": ["(Integer addlMinutes)"]
        }, {
            "type": "Datetime",
            "name": "addMonths",
            "parameters": ["(Integer addlMonths)"]
        }, {
            "type": "Datetime",
            "name": "addSeconds",
            "parameters": ["(Integer addlSeconds)"]
        }, {
            "type": "Datetime",
            "name": "addYears",
            "parameters": ["(Integer addlYears)"]
        }, {
            "type": "Date",
            "name": "date",
            "parameters": ["()"]
        }, {
            "type": "Date",
            "name": "dateGMT",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "day",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "dayGmt",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "dayOfYear",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "dayOfYearGmt",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "format",
            "parameters": ["()", "(String dateFormat)", "(String dateFormat, String timezone)"]
        }, {
            "type": "String",
            "name": "formatGmt",
            "parameters": ["(String dateFormat)"]
        }, {
            "type": "String",
            "name": "formatLong",
            "parameters": ["()"]
        }, {
            "type": "Long",
            "name": "getTime",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "hour",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "hourGmt",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isSameDay",
            "parameters": ["(Datetime compDt)"]
        }, {
            "type": "Integer",
            "name": "millisecond",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "millisecondGmt",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "minute",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "minuteGmt",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "month",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "monthGmt",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "second",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "secondGmt",
            "parameters": ["()"]
        }, {
            "type": "Time",
            "name": "time",
            "parameters": ["()"]
        }, {
            "type": "Time",
            "name": "timeGmt",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "year",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "yearGmt",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "UserProfiles": {
        "staticMethods": [{
            "type": "ConnectApi.UserProfile",
            "name": "getUserProfile",
            "parameters": ["(String communityId, String userId)"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "Double": {
        "staticMethods": [{
            "type": "Double",
            "name": "valueOf",
            "parameters": ["(String toDouble)", "(Object fieldValue)"]
        }],
        "instanceMethods": [{
            "type": "String",
            "name": "format",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "intValue",
            "parameters": ["()"]
        }, {
            "type": "Long",
            "name": "longValue",
            "parameters": ["()"]
        }, {
            "type": "Long",
            "name": "round",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "Integer": {
        "staticMethods": [{
            "type": "Integer",
            "name": "valueOf",
            "parameters": ["(String toInteger)", "(Object fieldValue)"]
        }],
        "instanceMethods": [{
            "type": "String",
            "name": "format",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "Long": {
        "staticMethods": [{
            "type": "Long",
            "name": "valueOf",
            "parameters": ["(String toLong)"]
        }],
        "instanceMethods": [{
            "type": "String",
            "name": "format",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "intValue",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "Blob": {
        "staticMethods": [{
            "type": "Blob",
            "name": "toPdf",
            "parameters": ["(String stringToConvert)"]
        }, {
            "type": "Blob",
            "name": "valueOf",
            "parameters": ["(String toBlob)"]
        }],
        "instanceMethods": [{
            "type": "Integer",
            "name": "size",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "toString",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "Boolean": {
        "staticMethods": [{
            "type": "Boolean",
            "name": "valueOf",
            "parameters": ["(String toBoolean)", "(Object fieldValue)"]
        }],
        "instanceMethods": [],
        "properties": [],
        "constructors": []
    },
    "Date": {
        "staticMethods": [{
            "type": "Integer",
            "name": "daysInMonth",
            "parameters": ["(Integer year, Integer month)"]
        }, {
            "type": "Boolean",
            "name": "isLeapYear",
            "parameters": ["(Integer year)"]
        }, {
            "type": "Date",
            "name": "newInstance",
            "parameters": ["(Integer year, Integer month, Integer date)"]
        }, {
            "type": "Date",
            "name": "parse",
            "parameters": ["(String Date)"]
        }, {
            "type": "Date",
            "name": "today",
            "parameters": ["()"]
        }, {
            "type": "Date",
            "name": "valueOf",
            "parameters": ["(String toDate)", "(Object fieldValue)"]
        }],
        "instanceMethods": [{
            "type": "Date",
            "name": "addDays",
            "parameters": ["(Integer addlDays)"]
        }, {
            "type": "Date",
            "name": "addMonths",
            "parameters": ["(Integer addlMonths)"]
        }, {
            "type": "Date",
            "name": "addYears",
            "parameters": ["(Integer addlYears)"]
        }, {
            "type": "Integer",
            "name": "day",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "dayOfYear",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "daysBetween",
            "parameters": ["(Date compDate)"]
        }, {
            "type": "String",
            "name": "format",
            "parameters": ["()"]
        }, {
            "type": "Boolean",
            "name": "isSameDay",
            "parameters": ["(Date compDate)"]
        }, {
            "type": "Integer",
            "name": "month",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "monthsBetween",
            "parameters": ["(Date compDate)"]
        }, {
            "type": "Date",
            "name": "toStartOfMonth",
            "parameters": ["()"]
        }, {
            "type": "Date",
            "name": "toStartOfWeek",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "year",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "Decimal": {
        "staticMethods": [{
            "type": "Decimal",
            "name": "valueOf",
            "parameters": ["(Double convertToDecimal)", "(Long convertToDecimal)", "(String convertToDecimal)"]
        }],
        "instanceMethods": [{
            "type": "Decimal",
            "name": "abs",
            "parameters": ["()"]
        }, {
            "type": "Decimal",
            "name": "divide",
            "parameters": ["(Decimal divisor, Integer scale)", "(Decimal divisor, Integer scale, Object roundingMode)"]
        }, {
            "type": "Double",
            "name": "doubleValue",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "format",
            "parameters": ["()"]
        }, {
            "type": "Integer",
            "name": "intValue",
            "parameters": ["()"]
        }, {
            "type": "Long",
            "name": "longValue",
            "parameters": ["()"]
        }, {
            "type": "Decimal",
            "name": "pow",
            "parameters": ["(Integer exponent)"]
        }, {
            "type": "Integer",
            "name": "precision",
            "parameters": ["()"]
        }, {
            "type": "Long",
            "name": "round",
            "parameters": ["()", "(System.RoundingMode roundingMode)"]
        }, {
            "type": "Integer",
            "name": "scale",
            "parameters": ["()"]
        }, {
            "type": "Decimal",
            "name": "setScale",
            "parameters": ["(Integer scale)", "(Integer scale, System.RoundingMode roundingMode)"]
        }, {
            "type": "Decimal",
            "name": "stripTrailingZeros",
            "parameters": ["()"]
        }, {
            "type": "String",
            "name": "toPlainString",
            "parameters": ["()"]
        }],
        "properties": [],
        "constructors": []
    },
    "Component": {
        "staticMethods": [],
        "instanceMethods": [],
        "properties": [{
            "type": "List<ApexPages.Component>",
            "name": "childComponents"
        }, {
            "type": "String",
            "name": "expressions"
        }, {
            "type": "String",
            "name": "facets"
        }],
        "constructors": []
    }
};