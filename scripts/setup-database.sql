-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image TEXT,
  ingredients TEXT[] NOT NULL,
  directions TEXT[] NOT NULL,
  categories TEXT[] NOT NULL,
  dateAdded TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cookTime TEXT,
  prepTime TEXT,
  totalTime TEXT,
  yield TEXT,
  comments TEXT
);

-- Create index for faster queries by user_id
CREATE INDEX IF NOT EXISTS recipes_user_id_idx ON recipes(user_id);

-- Set up row level security
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own recipes
CREATE POLICY "Users can only view their own recipes" 
  ON recipes FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy to allow users to only insert their own recipes
CREATE POLICY "Users can only insert their own recipes" 
  ON recipes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to only update their own recipes
CREATE POLICY "Users can only update their own recipes" 
  ON recipes FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy to allow users to only delete their own recipes
CREATE POLICY "Users can only delete their own recipes" 
  ON recipes FOR DELETE 
  USING (auth.uid() = user_id);
