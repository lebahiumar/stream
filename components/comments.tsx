"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, ThumbsDown } from "lucide-react"

interface CommentsProps {
  videoId: string
}

// Mock comments data
const mockComments = [
  {
    id: "1",
    author: "John Doe",
    avatar: "/placeholder.svg?height=40&width=40",
    content: "Great video! Really helpful content.",
    timestamp: "2 hours ago",
    likes: 12,
    dislikes: 0,
  },
  {
    id: "2",
    author: "Jane Smith",
    avatar: "/placeholder.svg?height=40&width=40",
    content: "Thanks for sharing this. Looking forward to more videos like this!",
    timestamp: "5 hours ago",
    likes: 8,
    dislikes: 1,
  },
  {
    id: "3",
    author: "Mike Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    content: "Could you make a follow-up video on this topic?",
    timestamp: "1 day ago",
    likes: 5,
    dislikes: 0,
  },
]

export function Comments({ videoId }: CommentsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-semibold">{mockComments.length} Comments</h2>
      </div>

      <div className="flex space-x-4">
        <Avatar>
          <AvatarImage src="/placeholder.svg?height=40&width=40" />
          <AvatarFallback>YU</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-3">
          <Textarea placeholder="Add a comment..." className="min-h-[80px]" />
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" size="sm">
              Cancel
            </Button>
            <Button size="sm">Comment</Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {mockComments.map((comment) => (
          <div key={comment.id} className="flex space-x-4">
            <Avatar>
              <AvatarImage src={comment.avatar || "/placeholder.svg"} />
              <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm">{comment.author}</span>
                <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
              </div>
              <p className="text-sm">{comment.content}</p>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  {comment.likes}
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <ThumbsDown className="w-4 h-4 mr-1" />
                  {comment.dislikes > 0 ? comment.dislikes : ""}
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  Reply
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
