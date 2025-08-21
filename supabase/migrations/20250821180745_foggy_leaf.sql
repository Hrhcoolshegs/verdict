/*
  # Update record_user_verdict function to handle vote counting

  1. Function Updates
    - Modified `record_user_verdict` to increment movie votes atomically
    - Ensures vote only counts when user verdict is successfully recorded
    - Returns detailed success/error information

  2. Security
    - Maintains unique constraint on (user_email, movie_id)
    - Prevents duplicate votes automatically
    - Atomic transaction ensures data consistency
*/

CREATE OR REPLACE FUNCTION record_user_verdict(
  p_user_email text,
  p_movie_id bigint,
  p_verdict_type text
) RETURNS json AS $$
DECLARE
  result json;
BEGIN
  -- Validate verdict type
  IF p_verdict_type NOT IN ('cinema', 'not-cinema') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid verdict type. Must be cinema or not-cinema.'
    );
  END IF;

  -- Check if user has already judged this movie
  IF EXISTS (
    SELECT 1 FROM user_verdicts 
    WHERE user_email = p_user_email AND movie_id = p_movie_id
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'You have already submitted a verdict for this movie.'
    );
  END IF;

  -- Insert user verdict and increment movie vote count atomically
  BEGIN
    -- Insert user verdict
    INSERT INTO user_verdicts (user_email, movie_id, verdict_type)
    VALUES (p_user_email, p_movie_id, p_verdict_type);

    -- Increment appropriate vote count in movies table
    IF p_verdict_type = 'cinema' THEN
      UPDATE movies 
      SET cinema_votes = cinema_votes + 1, updated_at = now()
      WHERE id = p_movie_id;
    ELSE
      UPDATE movies 
      SET not_cinema_votes = not_cinema_votes + 1, updated_at = now()
      WHERE id = p_movie_id;
    END IF;

    -- Return success
    RETURN json_build_object(
      'success', true,
      'message', 'Verdict recorded successfully!'
    );

  EXCEPTION
    WHEN unique_violation THEN
      RETURN json_build_object(
        'success', false,
        'error', 'You have already submitted a verdict for this movie.'
      );
    WHEN OTHERS THEN
      RETURN json_build_object(
        'success', false,
        'error', 'An error occurred while recording your verdict. Please try again.'
      );
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;