import { IconBtn } from "./IconBtn"
import { FaHeart, FaReply, FaEdit, FaTrash, FaRegHeart } from "react-icons/fa"
import { usePost } from './../contexts/PostContext';
import { CommentList } from './CommentList';
import { useState } from 'react';
import { CommentForm } from './CommentForm';
import { useAsyncFn } from "../hooks/useAsync";
import { createComment, updateComment, deleteComment, toogleCommentLike } from './../services/comments';
import { useUser } from './../hooks/useUser';

const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" })

export function Comment({ id, message, user, createdAt, likeCount, likedByMe }) {
    
    const { 
        post, 
        getReplies, 
        createLocalComment, 
        updateLocalComment, 
        deleteLocalComment,
        toogleLocalCommentLike
    } = usePost()
    const [isReplying, setIsReplying] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    

    const createCommentFn = useAsyncFn(createComment)
    const updateCommentFn = useAsyncFn(updateComment)
    const deleteCommentFn = useAsyncFn(deleteComment)
    const toogleCommentLikeFn = useAsyncFn(toogleCommentLike)

    const childComments = getReplies(id)
    const [areChildrenHidden, setAreChildrenHidden] = useState(false)
    const currentUser = useUser()

    function onCommentReply(message) {
        return createCommentFn
            .execute({ postId: post.id, message, parentId: id })
            .then(comment => {
                setIsReplying(false)
                createLocalComment(comment)
            })
    }

    function onCommentEdit(message) {
        return updateCommentFn
            .execute({ postId: post.id, message, id })
            .then(comment => {
                setIsEditing(false)
                updateLocalComment(id, comment.message)
            })
    }

    function onCommentDelete() {
        return deleteCommentFn
            .execute({ postId: post.id, id })
            .then((data) => deleteLocalComment(data.id))
    }

    function onCommentLike() {
        return toogleCommentLikeFn
            .execute({ id, postId: post.id })
            .then(({ addLike }) => toogleLocalCommentLike(id, addLike))
    }

    return (
        <>
            <div className="comment">
                <div className="header">
                    <span className="name">{user.name}</span>
                    <span className="date">{dateFormatter.format(Date.parse(createdAt))}</span>
                </div>
                {isEditing
                    ? (
                        <CommentForm
                            autoFocus
                            initialValue={message}
                            onSubmit={onCommentEdit}
                            loading={updateCommentFn.loading}
                            error={updateCommentFn.error} />
                    )
                    : (<div className="mesaage">{message}</div>
                    )}
                <div className="footer">
                    <IconBtn
                        Icon={likedByMe ? FaHeart : FaRegHeart}
                        onClick={onCommentLike}
                        disabled={toogleCommentLikeFn.loading}
                        aria-label={likedByMe ? "Unlike" : "Like"}>
                        {likeCount}
                    </IconBtn>
                    <IconBtn
                        onClick={() => setIsReplying(prev => !prev)}
                        isActive={isReplying}
                        Icon={FaReply}
                        aria-label={isReplying ? "Cancel Reply" : "Reply"} />
                    {user.id === currentUser.id && (
                        <>
                            <IconBtn
                                onClick={() => setIsEditing(prev => !prev)}
                                isActive={isEditing}
                                Icon={FaEdit}
                                aria-label={isEditing ? "Cancel Edit" : "Edit"} />
                            <IconBtn
                                Icon={FaTrash}
                                onClick={onCommentDelete}
                                disabled={deleteCommentFn.loading}
                                aria-label="Delete"
                                color="danger" />
                        </>
                    )}
                </div>
            </div>
            {isReplying && (
                <div className="mt-1 m1-3">
                    <CommentForm
                        autoFocus
                        onSubmit={onCommentReply}
                        loading={createCommentFn.loading}
                        error={createCommentFn.error} />
                </div>
            )}
            {childComments?.length > 0 && (
                <>
                    <div className={`nested-comments-stack ${areChildrenHidden ? "hide" : ""}`}>
                        <button className="collapse-line" aria-label="Hide Replies" onClick={() => setAreChildrenHidden(true)} />
                        <div className="nested-comments">
                            <CommentList comments={childComments} />
                        </div>
                    </div>
                    <button className={`btn mt-1 ${!areChildrenHidden ? "hide" : ""}`} onClick={() => setAreChildrenHidden(false)}>Show Replies</button>
                </>
            )}
        </>
    )
}