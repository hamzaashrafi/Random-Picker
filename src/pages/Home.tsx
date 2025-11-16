import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, Shuffle, Users, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Person {
  id: string;
  name: string;
  is_present: boolean;
}

const Home = () => {
  const [people, setPeople] = useState<Person[]>([]);
  const [newName, setNewName] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load team members from database
  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      
      if (data) {
        setPeople(data);
      }
    } catch (error: any) {
      console.error("Error loading team members:", error);
      toast.error("Failed to load team members");
    } finally {
      setIsLoading(false);
    }
  };

  const addPerson = async () => {
    if (!newName.trim()) {
      toast.error("Please enter a name");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("team_members")
        .insert([{ name: newName.trim(), is_present: true }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setPeople([...people, data]);
        setNewName("");
        toast.success(`${newName} added! 🎉`);
      }
    } catch (error: any) {
      console.error("Error adding person:", error);
      toast.error("Failed to add person");
    }
  };

  const removePerson = async (id: string) => {
    try {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setPeople(people.filter((p) => p.id !== id));
      toast.success("Person removed");
    } catch (error: any) {
      console.error("Error removing person:", error);
      toast.error("Failed to remove person");
    }
  };

  const togglePresence = async (id: string) => {
    const person = people.find((p) => p.id === id);
    if (!person) return;

    try {
      const { error } = await supabase
        .from("team_members")
        .update({ is_present: !person.is_present })
        .eq("id", id);

      if (error) throw error;

      setPeople(
        people.map((p) =>
          p.id === id ? { ...p, is_present: !p.is_present } : p
        )
      );
    } catch (error: any) {
      console.error("Error updating presence:", error);
      toast.error("Failed to update presence");
    }
  };

  const selectRandomPerson = () => {
    const presentPeople = people.filter((p) => p.is_present);

    if (presentPeople.length === 0) {
      toast.error("No one is present!");
      return;
    }

    setIsSpinning(true);
    setSelectedPerson(null);

    // Simulate spinning animation
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * presentPeople.length);
      const selected = presentPeople[randomIndex];
      setSelectedPerson(selected.name);
      setIsSpinning(false);
      toast.success(`${selected.name} will pay today! 🎉🍕`);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 md:p-8 animate-fade-in">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header with animated gradient */}
        <div className="text-center space-y-3 animate-scale-in">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-2">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">Lunch Picker</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Who's Paying? 🍽️
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Aaj kaun payment karega? Random selection se decide karo!
          </p>
        </div>

        {/* Add Person Section with enhanced styling */}
        <Card className="p-6 shadow-xl border-2 bg-card/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 animate-slide-in-right">
          <div className="flex gap-2">
            <Input
              placeholder="Team member ka naam..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addPerson()}
              className="flex-1 text-lg border-2 focus:border-primary transition-colors"
            />
            <Button 
              onClick={addPerson} 
              size="lg" 
              className="gap-2 shadow-lg hover:scale-105 transition-transform"
            >
              <Plus className="w-5 h-5" />
              Add
            </Button>
          </div>
        </Card>

        {/* People List with better animations */}
        {people.length > 0 && (
          <Card className="p-6 shadow-xl border-2 bg-card/80 backdrop-blur-sm animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-semibold">Team Members</h2>
              <span className="ml-auto px-3 py-1 bg-primary/10 rounded-full text-sm font-medium text-primary">
                {people.filter((p) => p.is_present).length} Present
              </span>
            </div>
            <div className="space-y-2">
              {people.map((person, index) => (
                <div
                  key={person.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 hover:from-muted hover:to-muted/50 transition-all duration-200 hover:scale-[1.02] border border-border/50"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={person.is_present}
                      onCheckedChange={() => togglePresence(person.id)}
                      id={person.id}
                      className="border-2"
                    />
                    <label
                      htmlFor={person.id}
                      className={`text-lg cursor-pointer font-medium transition-all ${
                        !person.is_present ? "line-through opacity-50" : "opacity-100"
                      }`}
                    >
                      {person.name}
                    </label>
                    {person.is_present && (
                      <span className="text-xs px-2 py-0.5 bg-secondary/20 text-secondary rounded-full">
                        Present
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePerson(person.id)}
                    className="hover:bg-destructive/10 hover:text-destructive hover:scale-110 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Selection Button with enhanced animation */}
        {people.filter((p) => p.is_present).length > 0 && (
          <div className="flex flex-col items-center gap-6">
            <Button
              onClick={selectRandomPerson}
              disabled={isSpinning}
              size="lg"
              className="w-full max-w-md h-16 text-xl font-bold shadow-2xl transform transition-all hover:scale-105 disabled:scale-100 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              <Shuffle className={`w-6 h-6 mr-2 ${isSpinning ? "animate-spin" : ""}`} />
              {isSpinning ? "Selecting..." : "🎲 Select Random Person"}
            </Button>

            {/* Result Display with celebration animation */}
            {selectedPerson && !isSpinning && (
              <Card className="p-10 text-center shadow-2xl border-4 border-primary bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 animate-scale-in backdrop-blur-sm">
                <p className="text-lg text-muted-foreground mb-2">
                  🎊 Today's payment by:
                </p>
                <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-4 animate-pulse">
                  {selectedPerson}
                </h2>
                <div className="flex items-center justify-center gap-2 text-3xl animate-bounce">
                  🎉 🍕 ☕ 🎊
                </div>
              </Card>
            )}

            {isSpinning && (
              <Card className="p-10 text-center shadow-xl animate-pulse bg-gradient-to-br from-muted/50 to-muted/30 backdrop-blur-sm">
                <div className="text-4xl font-bold text-foreground mb-2">
                  🎲 Selecting...
                </div>
                <div className="text-lg text-muted-foreground">
                  Kaun karega payment? 🤔
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Empty State with better design */}
        {people.length === 0 && (
          <Card className="p-12 text-center shadow-xl bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm border-2 border-dashed animate-fade-in">
            <div className="max-w-sm mx-auto space-y-4">
              <div className="text-6xl mb-4 animate-bounce">👥</div>
              <h3 className="text-2xl font-bold">No Team Members Yet</h3>
              <p className="text-muted-foreground">
                Add your lunch group members to get started!
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Home;
