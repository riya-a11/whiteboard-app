// Whiteboard Session
{
  _id: ObjectId,
  sessionId: String,  // Unique identifier for the whiteboard session
  elements: [         // Array of all drawing elements
    {
      tool: String,    // 'pencil', 'rectangle', 'circle', 'line', 'eraser'
      color: String,   // Hex color code
      lineWidth: Number,
      points: [        // Array of points for the element
        { x: Number, y: Number },
        ...
      ],
      createdAt: Date
    }
  ],
  users: [            // Array of users who have accessed this whiteboard
    {
      userId: String,
      name: String,
      color: String,   // User's cursor color
      lastActive: Date
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
