import React, { useContext, useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getPost } from "../services/posts";
import { useAsync } from './../hooks/useAsync';

const Context = React.createContext()

export function usePost() {
    return useContext(Context)
}

export function PostProvider({ children }) {
    const { id } = useParams()
    const { loading, error, value: post } = useAsync(() => getPost(id), [id])

    const [comments, setComments] = useState([])

    const commentsByParentId = useMemo(() => {
        if (comments == null) return []
        const group = {}
        comments.forEach(comment => {
            group[comment.parentId] ||= []
            group[comment.parentId].push(comment)
        })
        return group
    }, [comments])

    useEffect(() => {
        if (post?.comments == null) return
        setComments(post.comments)
    }, [post?.comments])

    function getReplies(parentId) {
        return commentsByParentId[parentId]
    }

    function createLocalComment(comment) {
        setComments(prevComments => {
            return [comment, ...prevComments]
        })
    }

    function updateLocalComment(id, message) {
        setComments(prevComments => 
            prevComments.map(comment => {
                if (comment.id === id) { return { ...comment, message } }
                else { return comment };
            })
        )
    }

    function deleteLocalComment(id) {
        setComments(prevComments => prevComments.filter(comment => comment.id !== id))
    }

    function toogleLocalCommentLike(id, addLike) {
        setComments(prevComments => {
            return prevComments.map(comment => {
                if (comment.id === id) {
                    if (addLike) {
                        return {
                            ...comment,
                            likeCount: comment.likeCount + 1,
                            likedByMe: true
                        }
                    } else {
                        return {
                            ...comment,
                            likeCount: comment.likeCount - 1,
                            likedByMe: false
                        }
                    }
                } else {
                    return comment
                }
            })
        })
    }

    return (
        <Context.Provider value={{
            post: { id, ...post },
            rootComments: commentsByParentId[null],
            getReplies,
            createLocalComment,
            updateLocalComment,
            deleteLocalComment,
            toogleLocalCommentLike
        }}>
            {loading ? (
                <h1>Loading</h1>
            ) : error ? (
                <h1 className="error-msg">{error}</h1>
            ) : (
                children
            )}
        </Context.Provider>
    )
}