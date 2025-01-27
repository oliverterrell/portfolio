**Goblins runs a real-time whiteboard transcription system that helps us understand student work.** As students solve problems on their digital whiteboard, our system analyzes their work. When they click "OK", we provide visual feedback about any unclear handwriting:

- For clearly written sections (high confidence), we silently transcribe the content
- For somewhat unclear parts (medium confidence), we highlight the area in orange and show our best guess, asking the student to confirm or correct it (e.g., "Is this a 3?")
- For very unclear sections (low confidence), we highlight the area in red and let the student know we can't read that part, prompting them to clean up their handwriting

This immediate feedback helps students maintain legible work while allowing them to focus on problem-solving. Here is an example whiteboard submitted by a student:

![Full whiteboard example](https://onnqckcdtgkezqrwvgrs.supabase.co/storage/v1/object/sign/internal/whiteboard-segmenter/whiteboard_3nwb0882nf0zirmc?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJpbnRlcm5hbC93aGl0ZWJvYXJkLXNlZ21lbnRlci93aGl0ZWJvYXJkXzNud2IwODgybmYwemlybWMiLCJpYXQiOjE3MjY3MDkzODgsImV4cCI6MjA0MjA2OTM4OH0.ddRt2cXsoEesBQu0Udxt_VFgjsp_0bHMojj6se0xhWY)

**Training such a system requires high-quality ground truth data that captures both what was written and how confidently we can read each part.** The challenge is non-trivial: mathematical notation is two-dimensional, context-dependent, and hierarchical. Our training data needs to reflect different confidence levels—from crystal clear expressions to barely legible scribbles, and everything in between.

**We need a labeling interface that helps contractors break whiteboards into meaningful chunks and assess their legibility.** Each chunk might be a complete equation, a diagram, or even just a troublesome symbol that needs clarification. The interface should make it easy to mark high-confidence regions where the writing is clear, medium-confidence regions where we might want student confirmation, and low-confidence regions where we definitely need the student to rewrite their work.

**We've prepared a dataset of student whiteboards to get started.** You'll receive a CSV file:

`whiteboards.csv`:
```csv
id,image_url
wb_456,https://cdn.../wb_456.png
wb_457,https://cdn.../wb_457.png
```

We'll provide:
- 100 complete whiteboard images
- Representative mix of simple and complex content
- Various handwriting styles and clarity levels

**Your task is to build a labeling interface that helps contractors identify and assess chunks of student work.** Each chunk needs both a transcription and a confidence level that will guide how our system interacts with students. For high-confidence chunks, we'll trust our transcription. For medium confidence, we'll ask for confirmation ("Is this a 3?"). For low confidence chunks, we'll ask students to rewrite their work.

**Core Requirements:**

Your solution needs to provide:

1. A web interface that contractors can access to label whiteboards. They should be able to select regions (chunks) of the whiteboard, transcribe them, and mark their confidence level in each transcription. Think carefully about the UI/UX that would help them work efficiently while maintaining quality.

2. A simple authentication system that lets contractors identify themselves by name. We need to track how many whiteboards and chunks each contractor has processed and when.

3. A data export system that generates a CSV containing all labeled chunks. Each chunk should include its coordinates on the whiteboard, transcription, confidence level, and reference back to its source whiteboard ID. When building this, work backwards from what data format would be most useful for training our confidence-aware transcription model.

**Show us your solution:**
1. Deploy your application publicly (use any hosting solution you prefer)
2. Share your GitHub repository with @Karavil

This should take 1-2 hours.

If you have any questions or thoughts about this project, shoot an email to [alp@goblinsapp.com](mailto:alp@goblinsapp.com)!
