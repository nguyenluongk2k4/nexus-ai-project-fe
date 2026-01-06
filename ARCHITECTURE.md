# Architecture Flow Diagram

![AI Chatbot System Architecture](/C:/Users/Admin/.gemini/antigravity/brain/d043d31f-3fc7-46dc-b5c9-59c09cfa0b23/nexus_ai_architecture_diagram_1767628110701.png)

## Tổng quan kiến trúc

```mermaid
flowchart TB
    subgraph FE["🖥️ Frontend (React/Vite)"]
        Chat["Chat.tsx"]
        WS["WebSocket Client"]
        UI["UI Components"]
    end

    subgraph BE["🐍 Backend (Python/FastAPI)"]
        Server["server.py<br/>(FastAPI)"]
        Chatbot["SmartChatbot"]
        Memory["SmartChatMemory"]
        RAG["SmartRAGRetriever"]
    end

    subgraph AI["🤖 AI Services"]
        Gemini["Gemini AI<br/>(gemini-2.5-flash)"]
        Embed["SentenceTransformer<br/>(paraphrase-multilingual-mpnet)"]
    end

    subgraph DB["💾 ChromaDB"]
        VectorDB["Vector Database<br/>(chroma_db/)"]
    end

    Chat --> |"1. User input"| WS
    WS --> |"2. WebSocket\nuser_message"| Server
    Server --> |"3. get_response()"| Chatbot
    Chatbot --> |"4. get_context()"| Memory
    Chatbot --> |"5. search()"| RAG
    RAG --> |"6. encode()"| Embed
    RAG --> |"7. query"| VectorDB
    VectorDB --> |"8. documents"| RAG
    Chatbot --> |"9. create_prompt()"| Chatbot
    Chatbot --> |"10. generate_content()"| Gemini
    Gemini --> |"11. AI response"| Chatbot
    Chatbot --> |"12. save to memory"| Memory
    Chatbot --> |"13. return answer"| Server
    Server --> |"14. bot_message"| WS
    WS --> |"15. Update UI"| Chat
```

---

## Chi tiết các Class

### Frontend

| Component | File | Chức năng |
|-----------|------|-----------|
| `Chat` | `Chat.tsx` | UI chat, quản lý WebSocket, render messages |
| `ChatMessage` | `Chat.tsx` | Interface cho tin nhắn (id, role, text) |

### Backend

| Class | File | Chức năng |
|-------|------|-----------|
| `FastAPI app` | `server.py` | HTTP/WebSocket server |
| `SmartChatbot` | `smart_chatbot.py` | Điều phối chính: Memory + RAG + AI |
| `SmartChatMemory` | `smart_chatbot.py` | Lưu trữ lịch sử chat theo session |
| `SmartRAGRetriever` | `smart_chatbot.py` | Tìm kiếm documents trong ChromaDB |

---

## Luồng xử lý chi tiết

```mermaid
sequenceDiagram
    participant User
    participant Chat as Chat.tsx
    participant WS as WebSocket
    participant Server as server.py
    participant Bot as SmartChatbot
    participant Mem as SmartChatMemory
    participant RAG as SmartRAGRetriever
    participant Gemini as Gemini AI
    participant Chroma as ChromaDB

    User->>Chat: Nhập câu hỏi
    Chat->>WS: send({type: "user_message", text})
    WS->>Server: WebSocket message
    Server->>Bot: get_response(text)
    
    Bot->>RAG: search(text, n_results=3)
    RAG->>RAG: encode(text) → vector
    RAG->>Chroma: query(vector)
    Chroma-->>RAG: relevant documents
    RAG-->>Bot: [doc1, doc2, doc3]
    
    Bot->>Mem: get_context_for_prompt()
    Mem-->>Bot: conversation history
    
    Bot->>Bot: create_prompt(question, docs)
    Bot->>Gemini: generate_content(prompt)
    Gemini-->>Bot: AI response
    
    Bot->>Mem: add_message(question, answer)
    Bot-->>Server: return answer
    
    Server->>WS: send({type: "bot_message", text})
    WS->>Chat: onmessage event
    Chat->>User: Hiển thị câu trả lời
```

---

## WebSocket Protocol

### Messages từ FE → BE

```json
{"type": "new_session"}
{"type": "user_message", "text": "...", "session_id": "..."}
{"type": "ping"}
```

### Messages từ BE → FE

```json
{"type": "session_started", "session_id": "..."}
{"type": "status", "status": "thinking|idle"}
{"type": "bot_message", "text": "...", "session_id": "..."}
{"type": "error", "error": "...", "message": "..."}
```

---

## Class Diagram

```mermaid
classDiagram
    class SmartChatbot {
        +memory: SmartChatMemory
        +retriever: SmartRAGRetriever
        +gemini_model: GenerativeModel
        +setup()
        +create_prompt(question, rag_results)
        +get_response(user_question)
        +process_command(command)
    }

    class SmartChatMemory {
        +sessions: Dict
        +current_session_id: str
        +current_context: List
        +load_sessions()
        +save_sessions()
        +start_new_session()
        +add_message(user_msg, ai_response)
        +get_context_for_prompt()
    }

    class SmartRAGRetriever {
        +embedding_model: SentenceTransformer
        +client: PersistentClient
        +collection: Collection
        +search(query_text, n_results)
    }

    SmartChatbot --> SmartChatMemory
    SmartChatbot --> SmartRAGRetriever
    SmartRAGRetriever --> ChromaDB
    SmartChatbot --> GeminiAI
```

---

## State Chart (Biểu đồ trạng thái)

Biểu đồ này mô tả các trạng thái của hệ thống và điều kiện chuyển đổi.

```mermaid
stateDiagram-v2
    [*] --> Disconnected
    Disconnected --> Connecting: WebSocket.connect()
    Connecting --> Idle: onopen / session_started
    Connecting --> Error: onerror / onclose
    
    state Idle {
        [*] --> WaitingForUser
        WaitingForUser --> Thinking: sendMessage()
    }
    
    state Thinking {
        [*] --> SearchingRAG
        SearchingRAG --> GeneratingAI: context ready
        GeneratingAI --> SavingHistory: response ready
    }
    
    Thinking --> Idle: bot_message / status: idle
    Thinking --> Error: exception / timeout
    
    Idle --> Error: onclose / onerror
    Error --> Connecting: Reconnect
    Error --> [*]
```

