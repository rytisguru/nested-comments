import { getPosts } from "../services/posts"
import { Link } from "react-router-dom"
import { useAsync } from './../hooks/useAsync';

export function PostList() {

    const { loading, error, value: posts } = useAsync(getPosts)

    if (loading) return <h1>Loading</h1>
    if (error) return <div className="error-msg">{error}</div>

    return posts.map(post => {
        return (
            <h1 key={post.id}>
                <Link to={`posts/${post.id}`}>{post.title}</Link>
            </h1>
        )
    })
}
