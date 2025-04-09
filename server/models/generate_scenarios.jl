
    # Simple scenario generation script
    using JSON
    
    function generate_scenarios()
        # Generate sample optimization scenarios
        scenarios = [
            Dict(
                "id" => 1,
                "name" => "Minimize Critical Path",
                "description" => "Optimizes work sequence to reduce the critical path length by identifying and eliminating bottlenecks",
                "riskReduction" => 35,
                "timelineReduction" => 28,
                "complexityScore" => 65
            ),
            Dict(
                "id" => 2,
                "name" => "Team Load Balancing",
                "description" => "Redistributes dependencies to balance workload across teams and reduce overallocation",
                "riskReduction" => 25,
                "timelineReduction" => 15,
                "complexityScore" => 40
            ),
            Dict(
                "id" => 3,
                "name" => "Dependency Cycle Breaking",
                "description" => "Identifies and resolves circular dependencies by suggesting parallel development opportunities",
                "riskReduction" => 45,
                "timelineReduction" => 20,
                "complexityScore" => 70
            )
        ]
        
        return scenarios
    end
    
    # Main function
    println(JSON.json(generate_scenarios()))
    