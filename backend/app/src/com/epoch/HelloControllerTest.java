
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

public class HelloControllerTest {

    @Test
    public void testHello() {
        HelloController controller = new HelloController();
        String expected = "Hello from Lambda!";
        String actual = controller.hello();
        assertEquals(expected, actual);
    }
}