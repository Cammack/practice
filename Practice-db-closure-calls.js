module.export = {
  
    reporting_site_stats: db => (req, res, next) => {
        var query = `
        SELECT
            substring(cast(s.created_at AS varchar), 0, 11) AS date,
            sum(es2.scenario_created) AS scenarios_created,
            sum(es2.scenario_results) AS results_created,
            sum(es2.submission_progress) AS sub_progress_created,
            sum(es2.submission_complete) AS sub_complete_created
        FROM public.scenarios s
        LEFT JOIN (
                SELECT 
                    CASE WHEN s2.created_at IS NULL THEN 0 ELSE 1 END AS scenario_created,
                    CASE WHEN s2.pricing_results::text ='[]' THEN 0 ELSE 1 END AS scenario_results,
                    CASE WHEN s2.stagename != 'Submission in Progress' THEN 0 ELSE 1 END AS submission_progress,
                    CASE WHEN s2.stagename != 'Complete Submission' THEN 0 ELSE 1 END AS submission_complete,
                    s2.id
                FROM public.scenarios s2
                WHERE (1=1)
                    ) es2 on es2.id = s.id
                group by date
                `;

        var query2 = `
        SELECT
          substring(cast(u.created_at AS varchar), 0, 11) AS date,
          sum(nu.new_users) as new_user_count
        FROM public.users u
        LEFT JOIN (SELECT
          u2.id,
          CASE WHEN u2.created_at IS NULL THEN 0 ELSE 1 END AS new_users
          FROM public.users u2) nu on nu.id = u.id
          WHERE(1=1)
        GROUP BY date 
        `;

        var query3= `
        select 
            *
        from public.users
        where 
        date_trunc('day', users.created_at) = '2019-08-05'
        `;
        
        db.query({
            text: query
        })
        .then(results => {
      
            db.query({
              text: query2
            })
            .then(results2 => {
                db.query({
                  text: query3
                })
                .then(results3 => {
                    
                    res.render("reporting_site_stats", {
                        data: {
                            payload: {
                                payload_pg: results.rows,
                                payload_pg2: results2.rows,
                                payload_pg3: results3.rows
                            },
                            user: req.user
                        }
                    });
                
                })
                .catch(e3 => {
                    res.status(500).json({ message: "error-3" });
                });
            })
            .catch(e2 => {
                res.status(500).json({ message: "error-2" });
            });
        })
        .catch(e => {
            res.status(500).json({ message: "error-1"})
        });
    },
};