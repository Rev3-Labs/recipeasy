-- This script creates a demo user in Supabase
-- Run this in the Supabase SQL editor

-- First, create the user in the auth schema
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  uuid_generate_v4(),
  'authenticated',
  'authenticated',
  'demo@example.com',
  -- This is the encrypted form of 'demo123456'
  '$2a$10$Ou.OWrJmCgKgXDwPj9yd3uV.aSrJMZ2.Uqm3.GR4rwjIHcjxHucUe',
  now(),
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Get the user ID we just created
DO $$
DECLARE
  demo_user_id UUID;
BEGIN
  SELECT id INTO demo_user_id FROM auth.users WHERE email = 'demo@example.com' LIMIT 1;
  
  -- Create some sample recipes for the demo user
  INSERT INTO public.recipes (
    id,
    user_id,
    url,
    title,
    description,
    image,
    ingredients,
    directions,
    categories,
    dateAdded,
    cookTime,
    prepTime,
    totalTime,
    yield
  ) VALUES (
    uuid_generate_v4(),
    demo_user_id,
    'https://example.com/demo-recipe',
    'Demo Chocolate Chip Cookies',
    'A delicious demo recipe for chocolate chip cookies that everyone will love.',
    'https://images.unsplash.com/photo-1499636136210-6f4ee915583e',
    ARRAY['2 1/4 cups all-purpose flour', '1 teaspoon baking soda', '1 teaspoon salt', '1 cup butter, softened', '3/4 cup granulated sugar', '3/4 cup packed brown sugar', '2 large eggs', '2 teaspoons vanilla extract', '2 cups chocolate chips'],
    ARRAY['Preheat oven to 375°F (190°C).', 'Combine flour, baking soda, and salt in a small bowl.', 'Beat butter, granulated sugar, and brown sugar in a large mixer bowl.', 'Add eggs one at a time, beating well after each addition. Beat in vanilla.', 'Gradually beat in flour mixture. Stir in chocolate chips.', 'Drop by rounded tablespoons onto ungreased baking sheets.', 'Bake for 9 to 11 minutes or until golden brown.', 'Cool on baking sheets for 2 minutes; remove to wire racks to cool completely.'],
    ARRAY['Dessert', 'Cookies', 'Baking'],
    now(),
    'PT15M',
    'PT15M',
    'PT30M',
    '24 cookies'
  );
END $$;
