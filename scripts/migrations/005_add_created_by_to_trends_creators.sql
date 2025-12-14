-- ===========================
-- Add created_by column to trends and creators tables
-- For user data isolation feature
-- ===========================

-- Add created_by to trends table
ALTER TABLE trends
ADD COLUMN created_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_trends_created_by ON trends(created_by);

-- Update existing data with default user (ba055e9d-8a37-4040-8c05-6cd16dd2d6bc)
UPDATE trends
SET created_by = 'ba055e9d-8a37-4040-8c05-6cd16dd2d6bc'
WHERE created_by IS NULL;

-- Add created_by to creators table
ALTER TABLE creators
ADD COLUMN created_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_creators_created_by ON creators(created_by);

-- Update existing data with default user (ba055e9d-8a37-4040-8c05-6cd16dd2d6bc)
UPDATE creators
SET created_by = 'ba055e9d-8a37-4040-8c05-6cd16dd2d6bc'
WHERE created_by IS NULL;

-- Add comments
COMMENT ON COLUMN trends.created_by IS '트렌드를 생성한 사용자 ID';
COMMENT ON COLUMN creators.created_by IS '크리에이터를 추가한 사용자 ID';
