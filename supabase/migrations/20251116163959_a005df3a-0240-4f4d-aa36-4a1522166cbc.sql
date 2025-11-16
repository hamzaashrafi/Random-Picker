-- Create table for team members
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  is_present BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (since this is a simple office tool)
CREATE POLICY "Anyone can view team members" 
ON public.team_members 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert team members" 
ON public.team_members 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update team members" 
ON public.team_members 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete team members" 
ON public.team_members 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_team_members_updated_at
BEFORE UPDATE ON public.team_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();