-- Users Table: Extended user profile information
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    display_name TEXT,
    profile_image_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    public_key TEXT,  -- For message encryption
    last_login_at TIMESTAMP,
    last_active_at TIMESTAMP,
    preferences JSONB DEFAULT '{}',  -- User preferences/settings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emails Table: Core email storage
CREATE TABLE emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES users(id),
    subject TEXT NOT NULL,
    content TEXT NOT NULL,  -- Encrypted content
    encrypted_key TEXT,     -- Encrypted message key
    is_encrypted BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    thread_id UUID,         -- For email threading
    parent_email_id UUID REFERENCES emails(id),  -- For replies
    importance TEXT CHECK (importance IN ('low', 'normal', 'high')),
    category TEXT DEFAULT 'primary',  -- primary, social, promotions, etc.
    read_receipt BOOLEAN DEFAULT FALSE,
    
    -- Flags
    has_attachments BOOLEAN DEFAULT FALSE,
    is_draft BOOLEAN DEFAULT FALSE,
    is_scheduled BOOLEAN DEFAULT FALSE,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email Recipients Table: Manages multiple recipients
CREATE TABLE email_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_id UUID REFERENCES emails(id),
    recipient_id UUID REFERENCES users(id),
    recipient_type TEXT CHECK (recipient_type IN ('to', 'cc', 'bcc')),
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived', 'deleted')),
    starred BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(email_id, recipient_id, recipient_type)
);

-- Attachments Table: Store email attachments
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_id UUID REFERENCES emails(id),
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    is_encrypted BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Labels Table: Custom email organization
CREATE TABLE labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    name TEXT NOT NULL,
    color TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Email Labels Table: Many-to-many relationship between emails and labels
CREATE TABLE email_labels (
    email_id UUID REFERENCES emails(id),
    label_id UUID REFERENCES labels(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (email_id, label_id)
);

-- Contacts Table: User's contact list
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    contact_email TEXT NOT NULL,
    full_name TEXT,
    profile_image_url TEXT,
    notes TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, contact_email)
);

-- Email Tracking Table: Track email interactions
CREATE TABLE email_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_id UUID REFERENCES emails(id),
    recipient_id UUID REFERENCES users(id),
    first_opened_at TIMESTAMP WITH TIME ZONE,
    last_opened_at TIMESTAMP WITH TIME ZONE,
    open_count INTEGER DEFAULT 0,
    user_agent TEXT,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Password Resets Table: Manages password reset requests
CREATE TABLE password_resets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),  -- Add reference to users table
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,   -- Track when the code was used
    CONSTRAINT fk_user
        FOREIGN KEY(user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Add indexes for faster lookups
CREATE INDEX idx_password_resets_user_id ON password_resets(user_id);
CREATE INDEX idx_password_resets_email ON password_resets(email);
CREATE INDEX idx_password_resets_code ON password_resets(code);

-- Add RLS policies
ALTER TABLE password_resets ENABLE ROW LEVEL SECURITY;

-- Allow insert for authenticated users
CREATE POLICY "Users can create their own reset codes" 
    ON password_resets FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

-- Allow read for code verification
CREATE POLICY "Users can verify their own reset codes" 
    ON password_resets FOR SELECT 
    USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Allow delete for used codes
CREATE POLICY "System can delete used reset codes" 
    ON password_resets FOR DELETE 
    USING (auth.uid() IS NOT NULL);

-- Create updated_at triggers for relevant tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emails_updated_at
    BEFORE UPDATE ON emails
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_recipients_updated_at
    BEFORE UPDATE ON email_recipients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 